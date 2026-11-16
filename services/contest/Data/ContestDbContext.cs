using JamesThew.ContestService.Models;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.ContestService.Data;

public sealed class ContestDbContext(DbContextOptions<ContestDbContext> options) : DbContext(options)
{
    public DbSet<ContestRecord> Contests => Set<ContestRecord>();
    public DbSet<ContestEntryRecord> Entries => Set<ContestEntryRecord>();
    public DbSet<ContestVoteRecord> Votes => Set<ContestVoteRecord>();
    public DbSet<AnnouncementRecord> Announcements => Set<AnnouncementRecord>();
    public DbSet<ContestOutboxMessage> OutboxMessages => Set<ContestOutboxMessage>();
    public DbSet<ContestMigrationMarker> MigrationMarkers => Set<ContestMigrationMarker>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ContestRecord>(entity =>
        {
            entity.ToTable("Contests");
            entity.HasKey(contest => contest.ContestId);
            entity.Property(contest => contest.Title).HasMaxLength(200).IsRequired();
            entity.Property(contest => contest.Description).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(contest => contest.ContestType).HasMaxLength(10).IsRequired();
            entity.Property(contest => contest.CreatorName).HasMaxLength(100).IsRequired();
            entity.HasMany(contest => contest.Entries).WithOne(entry => entry.Contest)
                .HasForeignKey(entry => entry.ContestId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(contest => new { contest.IsActive, contest.EndDate });
        });

        modelBuilder.Entity<ContestEntryRecord>(entity =>
        {
            entity.ToTable("ContestEntries");
            entity.HasKey(entry => entry.EntryId);
            entity.Property(entry => entry.GuestName).HasMaxLength(100);
            entity.Property(entry => entry.GuestEmail).HasMaxLength(150);
            entity.Property(entry => entry.SubmitterName).HasMaxLength(100).IsRequired();
            entity.Property(entry => entry.SubmitterEmail).HasMaxLength(150).IsRequired();
            entity.Property(entry => entry.Title).HasMaxLength(200).IsRequired();
            entity.Property(entry => entry.Ingredients).HasColumnType("nvarchar(max)");
            entity.Property(entry => entry.CookingProcedure).HasColumnType("nvarchar(max)");
            entity.Property(entry => entry.TipContent).HasColumnType("nvarchar(max)");
            entity.HasIndex(entry => new { entry.ContestId, entry.VoteCount });
        });

        modelBuilder.Entity<ContestVoteRecord>(entity =>
        {
            entity.ToTable("ContestVotes");
            entity.HasKey(vote => vote.VoteId);
            entity.Property(vote => vote.VoterIpOrEmail).HasMaxLength(150).IsRequired();
            entity.Property(vote => vote.VoterKey).HasMaxLength(200).IsRequired();
            entity.Property(vote => vote.IsLegacy).HasDefaultValue(false);
            entity.HasIndex(vote => new { vote.ContestEntryId, vote.UserId });
            entity.HasIndex(vote => new { vote.ContestEntryId, vote.VoterKey })
                .IsUnique()
                .HasFilter("[IsLegacy] = 0");
            entity.HasOne(vote => vote.Entry).WithMany(entry => entry.Votes)
                .HasForeignKey(vote => vote.ContestEntryId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AnnouncementRecord>(entity =>
        {
            entity.ToTable("Announcements");
            entity.HasKey(announcement => announcement.AnnouncementId);
            entity.Property(announcement => announcement.ContestTitle).HasMaxLength(200);
            entity.Property(announcement => announcement.WinnerTitle).HasMaxLength(200);
            entity.Property(announcement => announcement.WinnerName).HasMaxLength(100);
            entity.Property(announcement => announcement.Title).HasMaxLength(200).IsRequired();
            entity.Property(announcement => announcement.Content).HasColumnType("nvarchar(max)").IsRequired();
            entity.HasOne<ContestRecord>().WithMany().HasForeignKey(announcement => announcement.ContestId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasOne<ContestEntryRecord>().WithMany().HasForeignKey(announcement => announcement.WinnerEntryId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ContestOutboxMessage>(entity =>
        {
            entity.ToTable("ContestOutboxMessages");
            entity.HasKey(message => message.OutboxMessageId);
            entity.Property(message => message.RoutingKey).HasMaxLength(150).IsRequired();
            entity.Property(message => message.Payload).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(message => message.LastError).HasMaxLength(1000);
            entity.HasIndex(message => new { message.PublishedAtUtc, message.CreatedAtUtc });
        });

        modelBuilder.Entity<ContestMigrationMarker>(entity =>
        {
            entity.ToTable("ContestMigrationMarkers");
            entity.HasKey(marker => marker.MigrationKey);
            entity.Property(marker => marker.MigrationKey).HasMaxLength(100);
        });
    }
}
