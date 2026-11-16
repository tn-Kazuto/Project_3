using JamesThew.CatalogService.Models;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.CatalogService.Data;

public sealed class CatalogDbContext(DbContextOptions<CatalogDbContext> options) : DbContext(options)
{
    public DbSet<CategoryRecord> Categories => Set<CategoryRecord>();
    public DbSet<RecipeRecord> Recipes => Set<RecipeRecord>();
    public DbSet<TipRecord> Tips => Set<TipRecord>();
    public DbSet<FaqRecord> Faqs => Set<FaqRecord>();
    public DbSet<CatalogMigrationMarker> MigrationMarkers => Set<CatalogMigrationMarker>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CategoryRecord>(entity =>
        {
            entity.ToTable("Categories");
            entity.HasKey(category => category.CategoryId);
            entity.Property(category => category.CategoryName).HasMaxLength(100).IsRequired();
            entity.Property(category => category.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<RecipeRecord>(entity =>
        {
            entity.ToTable("Recipes");
            entity.HasKey(recipe => recipe.RecipeId);
            entity.Property(recipe => recipe.AuthorName).HasMaxLength(100).IsRequired();
            entity.Property(recipe => recipe.Title).HasMaxLength(200).IsRequired();
            entity.Property(recipe => recipe.Ingredients).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(recipe => recipe.CookingProcedure).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(recipe => recipe.ImageUrl).HasMaxLength(500);
            entity.Property(recipe => recipe.ContentType).HasMaxLength(20).IsRequired();
            entity.Property(recipe => recipe.VideoUrl).HasMaxLength(500);
            entity.Property(recipe => recipe.ThumbnailUrl).HasMaxLength(500);
            entity.HasIndex(recipe => new { recipe.IsFree, recipe.CreatedAt });
            entity.HasIndex(recipe => new { recipe.CategoryId, recipe.IsFree, recipe.CreatedAt });
            entity.HasOne(recipe => recipe.Category).WithMany(category => category.Recipes)
                .HasForeignKey(recipe => recipe.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TipRecord>(entity =>
        {
            entity.ToTable("Tips");
            entity.HasKey(tip => tip.TipId);
            entity.Property(tip => tip.AuthorName).HasMaxLength(100).IsRequired();
            entity.Property(tip => tip.Title).HasMaxLength(200).IsRequired();
            entity.Property(tip => tip.Content).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(tip => tip.VideoUrl).HasMaxLength(500);
            entity.HasIndex(tip => new { tip.IsFree, tip.CreatedAt });
        });

        modelBuilder.Entity<FaqRecord>(entity =>
        {
            entity.ToTable("Faqs");
            entity.HasKey(faq => faq.FaqId);
            entity.Property(faq => faq.Question).HasMaxLength(500).IsRequired();
            entity.Property(faq => faq.Answer).HasColumnType("nvarchar(max)").IsRequired();
        });

        modelBuilder.Entity<CatalogMigrationMarker>(entity =>
        {
            entity.ToTable("CatalogMigrationMarkers");
            entity.HasKey(marker => marker.MigrationKey);
            entity.Property(marker => marker.MigrationKey).HasMaxLength(100);
        });
    }
}
