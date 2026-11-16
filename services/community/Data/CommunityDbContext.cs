using JamesThew.CommunityService.Models;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.CommunityService.Data;

public sealed class CommunityDbContext(DbContextOptions<CommunityDbContext> options) : DbContext(options)
{
    public DbSet<FeedbackRecord> Feedbacks => Set<FeedbackRecord>();
    public DbSet<ShareLogRecord> ShareLogs => Set<ShareLogRecord>();
    public DbSet<RecipeShareBaseline> RecipeShareBaselines => Set<RecipeShareBaseline>();
    public DbSet<CommunityMigrationMarker> MigrationMarkers => Set<CommunityMigrationMarker>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FeedbackRecord>(entity =>
        {
            entity.ToTable("Feedbacks", table => table.HasCheckConstraint(
                "CK_Feedbacks_Rating", "[Rating] IS NULL OR [Rating] BETWEEN 1 AND 5"));
            entity.HasKey(feedback => feedback.FeedbackId);
            entity.Property(feedback => feedback.RecipeTitle).HasMaxLength(200);
            entity.Property(feedback => feedback.SenderName).HasMaxLength(100).IsRequired();
            entity.Property(feedback => feedback.SenderEmail).HasMaxLength(150).IsRequired();
            entity.Property(feedback => feedback.Comment).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(feedback => feedback.MediaUrl).HasMaxLength(500);
            entity.HasIndex(feedback => new { feedback.RecipeId, feedback.CreatedAt });
            entity.HasIndex(feedback => feedback.CreatedAt);
        });

        modelBuilder.Entity<ShareLogRecord>(entity =>
        {
            entity.ToTable("ShareLogs");
            entity.HasKey(share => share.ShareLogId);
            entity.Property(share => share.Channel).HasMaxLength(30).IsRequired();
            entity.HasIndex(share => new { share.RecipeId, share.SharedAtUtc });
        });

        modelBuilder.Entity<RecipeShareBaseline>(entity =>
        {
            entity.ToTable("RecipeShareBaselines");
            entity.HasKey(baseline => baseline.RecipeId);
            entity.Property(baseline => baseline.RecipeId).ValueGeneratedNever();
        });

        modelBuilder.Entity<CommunityMigrationMarker>(entity =>
        {
            entity.ToTable("CommunityMigrationMarkers");
            entity.HasKey(marker => marker.MigrationKey);
            entity.Property(marker => marker.MigrationKey).HasMaxLength(100);
        });
    }
}
