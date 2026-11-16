using Microsoft.EntityFrameworkCore;

namespace JamesThew.BillingService.Data;

public sealed class BillingDbContext(DbContextOptions<BillingDbContext> options) : DbContext(options)
{
    public DbSet<SubscriptionRecord> Subscriptions => Set<SubscriptionRecord>();
    public DbSet<BillingPayment> Payments => Set<BillingPayment>();
    public DbSet<BillingOutboxMessage> OutboxMessages => Set<BillingOutboxMessage>();
    public DbSet<BillingMigrationMarker> MigrationMarkers => Set<BillingMigrationMarker>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SubscriptionRecord>(entity =>
        {
            entity.ToTable("Subscriptions");
            entity.HasKey(subscription => subscription.SubscriptionId);
            entity.Property(subscription => subscription.PlanType).HasMaxLength(10).IsRequired();
            entity.Property(subscription => subscription.Amount).HasPrecision(10, 2);
            entity.Property(subscription => subscription.Status).HasMaxLength(15).IsRequired();
            entity.HasIndex(subscription => new { subscription.UserId, subscription.EndDateUtc });
            entity.HasIndex(subscription => subscription.LegacySourceUserId)
                .IsUnique()
                .HasFilter("[LegacySourceUserId] IS NOT NULL");
        });

        modelBuilder.Entity<BillingPayment>(entity =>
        {
            entity.ToTable("Payments");
            entity.HasKey(payment => payment.PaymentId);
            entity.Property(payment => payment.PlanType).HasMaxLength(10).IsRequired();
            entity.Property(payment => payment.Amount).HasPrecision(10, 2);
            entity.Property(payment => payment.Status).HasMaxLength(15).IsRequired();
            entity.Property(payment => payment.IdempotencyKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(payment => new { payment.UserId, payment.IdempotencyKey }).IsUnique();
            entity.HasIndex(payment => payment.LegacySourcePaymentId)
                .IsUnique()
                .HasFilter("[LegacySourcePaymentId] IS NOT NULL");
            entity.HasOne<SubscriptionRecord>()
                .WithMany()
                .HasForeignKey(payment => payment.SubscriptionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<BillingOutboxMessage>(entity =>
        {
            entity.ToTable("BillingOutboxMessages");
            entity.HasKey(message => message.OutboxMessageId);
            entity.Property(message => message.RoutingKey).HasMaxLength(150).IsRequired();
            entity.Property(message => message.Payload).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(message => message.LastError).HasMaxLength(1000);
            entity.HasIndex(message => new { message.PublishedAtUtc, message.CreatedAtUtc });
        });

        modelBuilder.Entity<BillingMigrationMarker>(entity =>
        {
            entity.ToTable("BillingMigrationMarkers");
            entity.HasKey(marker => marker.MigrationKey);
            entity.Property(marker => marker.MigrationKey).HasMaxLength(100);
        });
    }
}
