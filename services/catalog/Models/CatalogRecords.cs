namespace JamesThew.CatalogService.Models;

public sealed class CategoryRecord
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<RecipeRecord> Recipes { get; set; } = new List<RecipeRecord>();
}

public sealed class RecipeRecord
{
    public int RecipeId { get; set; }
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Ingredients { get; set; } = string.Empty;
    public string CookingProcedure { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsFree { get; set; }
    public string ContentType { get; set; } = "ARTICLE";
    public string? VideoUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int ShareCount { get; set; }
    public int FeedbackCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public CategoryRecord Category { get; set; } = null!;
}

public sealed class TipRecord
{
    public int TipId { get; set; }
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsFree { get; set; }
    public string? VideoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public sealed class FaqRecord
{
    public int FaqId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public sealed class CatalogMigrationMarker
{
    public string MigrationKey { get; set; } = string.Empty;
    public DateTime AppliedAtUtc { get; set; }
}
