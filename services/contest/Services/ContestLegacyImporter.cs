using JamesThew.ContestService.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace JamesThew.ContestService.Services;

public sealed class ContestLegacyImporter(
    ContestDbContext contestDb,
    IConfiguration configuration,
    ILogger<ContestLegacyImporter> logger)
{
    private const string MigrationKey = "legacy-contests-v1";

    public async Task ImportAsync(CancellationToken cancellationToken)
    {
        if (await contestDb.MigrationMarkers.AnyAsync(marker => marker.MigrationKey == MigrationKey, cancellationToken))
        {
            return;
        }

        var legacyConnection = configuration.GetConnectionString("LegacyConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:LegacyConnection is required for contest data import.");
        var source = new SqlConnectionStringBuilder(legacyConnection);
        var destination = new SqlConnectionStringBuilder(contestDb.Database.GetConnectionString());
        if (!string.Equals(source.DataSource, destination.DataSource, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Contest legacy import requires the legacy and contest databases on the same SQL Server instance.");
        }

        var sourceDatabase = $"[{source.InitialCatalog.Replace("]", "]]", StringComparison.Ordinal)}]";
        var sql = BuildImportSql(sourceDatabase);
        await contestDb.Database.ExecuteSqlRawAsync(sql, cancellationToken);
        logger.LogInformation("Imported legacy contest, entry, vote, and announcement data from {Database}.", source.InitialCatalog);
    }

    private static string BuildImportSql(string sourceDatabase) => $"""
        SET XACT_ABORT ON;
        BEGIN TRANSACTION;
        DECLARE @lockResult int;
        EXEC @lockResult = sys.sp_getapplock
            @Resource = 'JamesThew.ContestService.LegacyImport',
            @LockMode = 'Exclusive',
            @LockOwner = 'Transaction',
            @LockTimeout = 30000;
        IF @lockResult < 0 THROW 51000, 'Could not acquire contest import lock.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.ContestMigrationMarkers WHERE MigrationKey = '{MigrationKey}')
        BEGIN
            SET IDENTITY_INSERT dbo.Contests ON;
            INSERT INTO dbo.Contests
                (ContestId, Title, Description, ContestType, StartDate, EndDate, IsActive, CreatedBy, CreatorName)
            SELECT c.ContestId, c.Title, CONVERT(nvarchar(max), c.Description), c.ContestType, c.StartDate, c.EndDate, c.IsActive, c.CreatedBy,
                   COALESCE(u.FullName, u.Username, N'Admin')
            FROM {sourceDatabase}.dbo.Contests c
            LEFT JOIN {sourceDatabase}.dbo.Users u ON u.UserId = c.CreatedBy;
            SET IDENTITY_INSERT dbo.Contests OFF;

            SET IDENTITY_INSERT dbo.ContestEntries ON;
            INSERT INTO dbo.ContestEntries
                (EntryId, ContestId, UserId, GuestName, GuestEmail, SubmitterName, SubmitterEmail, Title,
                 Ingredients, CookingProcedure, TipContent, SubmittedAt, IsWinner, VoteCount)
            SELECT e.EntryId, e.ContestId, e.UserId, e.GuestName, e.GuestEmail,
                   COALESCE(u.FullName, u.Username, e.GuestName, N'Guest'),
                   COALESCE(u.Email, e.GuestEmail, N''), e.Title,
                   CONVERT(nvarchar(max), e.Ingredients), CONVERT(nvarchar(max), e.CookingProcedure),
                   CONVERT(nvarchar(max), e.TipContent), e.SubmittedAt, e.IsWinner, e.VoteCount
            FROM {sourceDatabase}.dbo.ContestEntries e
            LEFT JOIN {sourceDatabase}.dbo.Users u ON u.UserId = e.UserId;
            SET IDENTITY_INSERT dbo.ContestEntries OFF;

            SET IDENTITY_INSERT dbo.ContestVotes ON;
            INSERT INTO dbo.ContestVotes
                (VoteId, ContestEntryId, UserId, VoterIpOrEmail, VoterKey, IsLegacy, VotedAt)
            SELECT v.VoteId, v.ContestEntryId, v.UserId, v.VoterIpOrEmail,
                   CASE WHEN v.UserId IS NOT NULL THEN CONCAT(N'member:', v.UserId)
                        ELSE CONCAT(N'guest:', LOWER(LTRIM(RTRIM(v.VoterIpOrEmail)))) END,
                   1, v.VotedAt
            FROM {sourceDatabase}.dbo.ContestVotes v;
            SET IDENTITY_INSERT dbo.ContestVotes OFF;

            SET IDENTITY_INSERT dbo.Announcements ON;
            INSERT INTO dbo.Announcements
                (AnnouncementId, ContestId, ContestTitle, WinnerEntryId, WinnerTitle, WinnerName, WinnerEmail,
                 Title, Content, PublishedAt, IsEmailSent)
            SELECT a.AnnouncementId, a.ContestId, c.Title, a.WinnerEntryId, e.Title,
                   COALESCE(u.FullName, u.Username, e.GuestName), COALESCE(u.Email, e.GuestEmail),
                   a.Title, CONVERT(nvarchar(max), a.Content), a.PublishedAt, a.IsEmailSent
            FROM {sourceDatabase}.dbo.Announcements a
            LEFT JOIN {sourceDatabase}.dbo.Contests c ON c.ContestId = a.ContestId
            LEFT JOIN {sourceDatabase}.dbo.ContestEntries e ON e.EntryId = a.WinnerEntryId
            LEFT JOIN {sourceDatabase}.dbo.Users u ON u.UserId = e.UserId;
            SET IDENTITY_INSERT dbo.Announcements OFF;

            INSERT INTO dbo.ContestMigrationMarkers (MigrationKey, AppliedAtUtc)
            VALUES ('{MigrationKey}', SYSUTCDATETIME());
        END;

        COMMIT TRANSACTION;
        """;
}
