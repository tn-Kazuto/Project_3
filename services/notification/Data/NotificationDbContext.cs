using JamesThew.NotificationService.Models;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.NotificationService.Data;

/// <summary>Database owned by the notification service.</summary>
public sealed class NotificationDbContext(DbContextOptions<NotificationDbContext> options) : DbContext(options)
{
    public DbSet<NotificationRecord> Notifications => Set<NotificationRecord>();
    public DbSet<NotificationRecipient> Recipients => Set<NotificationRecipient>();
    public DbSet<NotificationImportMarker> ImportMarkers => Set<NotificationImportMarker>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<NotificationRecord>(entity =>
        {
            entity.ToTable("Notifications");
            entity.HasKey(notification => notification.NotificationId);
            entity.Property(notification => notification.Title).HasMaxLength(200).IsRequired();
            entity.Property(notification => notification.Message).HasMaxLength(2000).IsRequired();
            entity.Property(notification => notification.TargetUrl).HasMaxLength(500);
            entity.Property(notification => notification.EventKey).HasMaxLength(350);
            entity.HasIndex(notification => new { notification.UserId, notification.CreatedAt });
            entity.HasIndex(notification => notification.EventKey)
                .IsUnique()
                .HasFilter("[EventKey] IS NOT NULL");
        });

        modelBuilder.Entity<NotificationRecipient>(entity =>
        {
            entity.ToTable("NotificationRecipients");
            entity.HasKey(recipient => recipient.UserId);
            entity.Property(recipient => recipient.Email).HasMaxLength(150).IsRequired();
            entity.HasIndex(recipient => recipient.IsActive);
        });

        modelBuilder.Entity<NotificationImportMarker>(entity =>
        {
            entity.ToTable("NotificationImportMarkers");
            entity.HasKey(marker => marker.ImportKey);
            entity.Property(marker => marker.ImportKey).HasMaxLength(100);
        });
    }
}
