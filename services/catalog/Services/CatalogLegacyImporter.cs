using JamesThew.CatalogService.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.CatalogService.Services;

public sealed class CatalogLegacyImporter(
    CatalogDbContext catalogDb,
    IConfiguration configuration,
    ILogger<CatalogLegacyImporter> logger)
{
    private const string MigrationKey = "legacy-catalog-v1";

    public async Task ImportAsync(CancellationToken cancellationToken)
    {
        if (await catalogDb.MigrationMarkers.AnyAsync(marker => marker.MigrationKey == MigrationKey, cancellationToken))
        {
            return;
        }

        var legacyConnection = configuration.GetConnectionString("LegacyConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:LegacyConnection is required for catalog data import.");
        var source = new SqlConnectionStringBuilder(legacyConnection);
        var destination = new SqlConnectionStringBuilder(catalogDb.Database.GetConnectionString());
        if (!string.Equals(source.DataSource, destination.DataSource, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Catalog legacy import requires both databases on the same SQL Server instance.");
        }

        var sourceDatabase = $"[{source.InitialCatalog.Replace("]", "]]", StringComparison.Ordinal)}]";
        await catalogDb.Database.ExecuteSqlRawAsync(BuildImportSql(sourceDatabase), cancellationToken);
        logger.LogInformation("Imported legacy catalog content from {Database}.", source.InitialCatalog);
    }

    private static string BuildImportSql(string sourceDatabase) => $"""
        SET XACT_ABORT ON;
        BEGIN TRANSACTION;
        DECLARE @lockResult int;
        EXEC @lockResult = sys.sp_getapplock
            @Resource = 'JamesThew.CatalogService.LegacyImport',
            @LockMode = 'Exclusive',
            @LockOwner = 'Transaction',
            @LockTimeout = 30000;
        IF @lockResult < 0 THROW 51000, 'Could not acquire catalog import lock.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.CatalogMigrationMarkers WHERE MigrationKey = '{MigrationKey}')
        BEGIN
            SET IDENTITY_INSERT dbo.Categories ON;
            INSERT INTO dbo.Categories (CategoryId, CategoryName, Description)
            SELECT CategoryId, CategoryName, Description
            FROM {sourceDatabase}.dbo.Categories;
            SET IDENTITY_INSERT dbo.Categories OFF;

            SET IDENTITY_INSERT dbo.Recipes ON;
            INSERT INTO dbo.Recipes
                (RecipeId, AuthorId, AuthorName, CategoryId, Title, Ingredients, CookingProcedure,
                 ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, FeedbackCount, CreatedAt, UpdatedAt)
            SELECT r.RecipeId, r.AuthorId, COALESCE(u.FullName, u.Username, N'Unknown'), r.CategoryId,
                   r.Title, CONVERT(nvarchar(max), r.Ingredients), CONVERT(nvarchar(max), r.CookingProcedure),
                   r.ImageUrl, r.IsFree, COALESCE(r.ContentType, N'ARTICLE'), r.VideoUrl, r.ThumbnailUrl,
                   r.ShareCount, COALESCE(f.FeedbackCount, 0), r.CreatedAt, r.UpdatedAt
            FROM {sourceDatabase}.dbo.Recipes r
            LEFT JOIN {sourceDatabase}.dbo.Users u ON u.UserId = r.AuthorId
            LEFT JOIN (
                SELECT RecipeId, COUNT(*) AS FeedbackCount
                FROM {sourceDatabase}.dbo.Feedbacks
                WHERE RecipeId IS NOT NULL
                GROUP BY RecipeId
            ) f ON f.RecipeId = r.RecipeId;
            SET IDENTITY_INSERT dbo.Recipes OFF;

            SET IDENTITY_INSERT dbo.Tips ON;
            INSERT INTO dbo.Tips (TipId, AuthorId, AuthorName, Title, Content, IsFree, VideoUrl, CreatedAt, UpdatedAt)
            SELECT t.TipId, t.AuthorId, COALESCE(u.FullName, u.Username, N'Unknown'), t.Title,
                   CONVERT(nvarchar(max), t.Content), t.IsFree, t.VideoUrl, t.CreatedAt, t.UpdatedAt
            FROM {sourceDatabase}.dbo.Tips t
            LEFT JOIN {sourceDatabase}.dbo.Users u ON u.UserId = t.AuthorId;
            SET IDENTITY_INSERT dbo.Tips OFF;

            SET IDENTITY_INSERT dbo.Faqs ON;
            INSERT INTO dbo.Faqs (FaqId, Question, Answer, DisplayOrder)
            SELECT FaqId, Question, CONVERT(nvarchar(max), Answer), DisplayOrder
            FROM {sourceDatabase}.dbo.Faqs;
            SET IDENTITY_INSERT dbo.Faqs OFF;

            INSERT INTO dbo.CatalogMigrationMarkers (MigrationKey, AppliedAtUtc)
            VALUES ('{MigrationKey}', SYSUTCDATETIME());
        END;

        COMMIT TRANSACTION;
        """;
}
