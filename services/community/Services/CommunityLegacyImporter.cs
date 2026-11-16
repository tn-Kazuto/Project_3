using JamesThew.CommunityService.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.CommunityService.Services;

public sealed class CommunityLegacyImporter(
    CommunityDbContext communityDb,
    IConfiguration configuration,
    ILogger<CommunityLegacyImporter> logger)
{
    private const string MigrationKey = "legacy-community-v1";

    public async Task ImportAsync(CancellationToken cancellationToken)
    {
        if (await communityDb.MigrationMarkers.AnyAsync(marker => marker.MigrationKey == MigrationKey, cancellationToken))
        {
            return;
        }

        var legacyConnection = configuration.GetConnectionString("LegacyConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:LegacyConnection is required for community data import.");
        var source = new SqlConnectionStringBuilder(legacyConnection);
        var destination = new SqlConnectionStringBuilder(communityDb.Database.GetConnectionString());
        if (!string.Equals(source.DataSource, destination.DataSource, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Community legacy import requires both databases on the same SQL Server instance.");
        }

        var databaseName = $"[{source.InitialCatalog.Replace("]", "]]", StringComparison.Ordinal)}]";
        await communityDb.Database.ExecuteSqlRawAsync(BuildImportSql(databaseName), cancellationToken);
        logger.LogInformation("Imported legacy feedback and share-count data from {Database}.", source.InitialCatalog);
    }

    private static string BuildImportSql(string sourceDatabase) => $"""
        SET XACT_ABORT ON;
        BEGIN TRANSACTION;
        DECLARE @lockResult int;
        EXEC @lockResult = sys.sp_getapplock
            @Resource = 'JamesThew.CommunityService.LegacyImport',
            @LockMode = 'Exclusive',
            @LockOwner = 'Transaction',
            @LockTimeout = 30000;
        IF @lockResult < 0 THROW 51000, 'Could not acquire community import lock.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.CommunityMigrationMarkers WHERE MigrationKey = '{MigrationKey}')
        BEGIN
            SET IDENTITY_INSERT dbo.Feedbacks ON;
            INSERT INTO dbo.Feedbacks
                (FeedbackId, RecipeId, RecipeTitle, UserId, SenderName, SenderEmail, Comment, MediaUrl, Rating, CreatedAt)
            SELECT f.FeedbackId, f.RecipeId, r.Title, f.UserId, f.SenderName, f.SenderEmail,
                   CONVERT(nvarchar(max), f.Comment), f.MediaUrl, f.Rating, f.CreatedAt
            FROM {sourceDatabase}.dbo.Feedbacks f
            LEFT JOIN {sourceDatabase}.dbo.Recipes r ON r.RecipeId = f.RecipeId;
            SET IDENTITY_INSERT dbo.Feedbacks OFF;

            INSERT INTO dbo.RecipeShareBaselines (RecipeId, LegacyShareCount)
            SELECT RecipeId, ShareCount
            FROM {sourceDatabase}.dbo.Recipes;

            INSERT INTO dbo.CommunityMigrationMarkers (MigrationKey, AppliedAtUtc)
            VALUES ('{MigrationKey}', SYSUTCDATETIME());
        END;

        COMMIT TRANSACTION;
        """;
}
