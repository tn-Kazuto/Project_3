using Microsoft.EntityFrameworkCore;

namespace JamesThew.PaymentService.Data;

public sealed class PaymentDbContext(DbContextOptions<PaymentDbContext> options) : DbContext(options)
{
    public DbSet<PaymentRecord> Payments => Set<PaymentRecord>();
    public DbSet<PaymentMigrationMarker> MigrationMarkers => Set<PaymentMigrationMarker>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PaymentRecord>(entity =>
        {
            entity.ToTable("Payments");
            entity.HasKey(payment => payment.PaymentId);
            entity.Property(payment => payment.PlanType).HasMaxLength(10).IsRequired();
            entity.Property(payment => payment.Amount).HasPrecision(10, 2);
            entity.Property(payment => payment.CardLast4).HasMaxLength(4).IsRequired();
            entity.Property(payment => payment.CardHolderName).HasMaxLength(100).IsRequired();
            entity.Property(payment => payment.Status).HasMaxLength(15).IsRequired();
            entity.Property(payment => payment.IdempotencyKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(payment => new { payment.UserId, payment.IdempotencyKey }).IsUnique();
            entity.HasIndex(payment => new { payment.UserId, payment.PaymentDateUtc });
            entity.HasIndex(payment => payment.LegacySourcePaymentId)
                .IsUnique()
                .HasFilter("[LegacySourcePaymentId] IS NOT NULL");
        });

        modelBuilder.Entity<PaymentMigrationMarker>(entity =>
        {
            entity.ToTable("PaymentMigrationMarkers");
            entity.HasKey(marker => marker.MigrationKey);
            entity.Property(marker => marker.MigrationKey).HasMaxLength(100);
        });
    }
}
