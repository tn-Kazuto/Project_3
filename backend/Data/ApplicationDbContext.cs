using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data
{
    /// <summary>
    /// Entity Framework Core database context for the James Thew Cooking Website.
    /// Manages entity configurations, relationships, constraints, and database access.
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Recipe> Recipes => Set<Recipe>();
        public DbSet<Tip> Tips => Set<Tip>();
        public DbSet<Contest> Contests => Set<Contest>();
        public DbSet<ContestEntry> ContestEntries => Set<ContestEntry>();
        public DbSet<Announcement> Announcements => Set<Announcement>();
        public DbSet<Feedback> Feedbacks => Set<Feedback>();
        public DbSet<Faq> Faqs => Set<Faq>();
        public DbSet<ContestVote> ContestVotes => Set<ContestVote>();
        public DbSet<Notification> Notifications => Set<Notification>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User constraints & indices
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.HasIndex(u => u.Username).IsUnique();
                entity.Property(u => u.SubscriptionAmount).HasPrecision(10, 2);
            });

            // Payment constraints
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.Property(p => p.Amount).HasPrecision(10, 2);
                entity.HasOne(p => p.User)
                      .WithMany(u => u.Payments)
                      .HasForeignKey(p => p.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Recipe relationships
            modelBuilder.Entity<Recipe>(entity =>
            {
                entity.HasOne(r => r.Author)
                      .WithMany(u => u.Recipes)
                      .HasForeignKey(r => r.AuthorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Category)
                      .WithMany(c => c.Recipes)
                      .HasForeignKey(r => r.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Tip relationships
            modelBuilder.Entity<Tip>(entity =>
            {
                entity.HasOne(t => t.Author)
                      .WithMany(u => u.Tips)
                      .HasForeignKey(t => t.AuthorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Contest relationships
            modelBuilder.Entity<Contest>(entity =>
            {
                entity.HasOne(c => c.Creator)
                      .WithMany()
                      .HasForeignKey(c => c.CreatedBy)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ContestEntry relationships (Guest entries have null UserId)
            modelBuilder.Entity<ContestEntry>(entity =>
            {
                entity.HasOne(ce => ce.Contest)
                      .WithMany(c => c.Entries)
                      .HasForeignKey(ce => ce.ContestId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ce => ce.User)
                      .WithMany()
                      .HasForeignKey(ce => ce.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Announcement relationships
            modelBuilder.Entity<Announcement>(entity =>
            {
                entity.HasOne(a => a.Contest)
                      .WithMany(c => c.Announcements)
                      .HasForeignKey(a => a.ContestId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(a => a.WinnerEntry)
                      .WithMany()
                      .HasForeignKey(a => a.WinnerEntryId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Feedback relationships (Can be for recipe or general website, guest or member)
            modelBuilder.Entity<Feedback>(entity =>
            {
                entity.HasOne(f => f.Recipe)
                      .WithMany(r => r.Feedbacks)
                      .HasForeignKey(f => f.RecipeId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(f => f.User)
                      .WithMany()
                      .HasForeignKey(f => f.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // ContestVote relationships & fraud prevention indices
            modelBuilder.Entity<ContestVote>(entity =>
            {
                entity.HasIndex(v => new { v.ContestEntryId, v.VoterIpOrEmail });

                entity.HasOne(v => v.ContestEntry)
                      .WithMany(ce => ce.Votes)
                      .HasForeignKey(v => v.ContestEntryId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(v => v.User)
                      .WithMany(u => u.ContestVotes)
                      .HasForeignKey(v => v.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Notification relationships
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasOne(n => n.User)
                      .WithMany(u => u.Notifications)
                      .HasForeignKey(n => n.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}

