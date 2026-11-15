using Microsoft.EntityFrameworkCore;

namespace JamesThew.MediaService.Data;

public sealed class MediaDbContext(DbContextOptions<MediaDbContext> options) : DbContext(options)
{
    public DbSet<MediaUploadTicket> UploadTickets => Set<MediaUploadTicket>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var ticket = modelBuilder.Entity<MediaUploadTicket>();
        ticket.ToTable("MediaUploadTickets");
        ticket.HasKey(item => item.TicketId);
        ticket.Property(item => item.ResourceType).HasMaxLength(16).IsRequired();
        ticket.Property(item => item.ContentType).HasMaxLength(100).IsRequired();
        ticket.Property(item => item.PublicId).HasMaxLength(200).IsRequired();
        ticket.Property(item => item.Format).HasMaxLength(16);
        ticket.Property(item => item.SecureUrl).HasMaxLength(1000);
        ticket.HasIndex(item => new { item.UserId, item.ExpiresAtUtc });
    }
}
