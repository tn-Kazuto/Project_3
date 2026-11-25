using System.ComponentModel.DataAnnotations;

namespace JamesThew.CatalogService.DTOs;

public sealed class RecipeDto
{
    public int RecipeId { get; set; }
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Ingredients { get; set; } = string.Empty;
    public string CookingProcedure { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsFree { get; set; }
    public string ContentType { get; set; } = "ARTICLE";
    public string? VideoUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int ShareCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int FeedbackCount { get; set; }
    public string AccessLevel { get; set; } = "FULL";
    public bool IsContentTruncated { get; set; }
}

public sealed class CreateRecipeRequest
{
    [Range(1, int.MaxValue)] public int CategoryId { get; set; }
    [Required, StringLength(200)] public string Title { get; set; } = string.Empty;
    [Required] public string Ingredients { get; set; } = string.Empty;
    [Required] public string CookingProcedure { get; set; } = string.Empty;
    [StringLength(500)] public string? ImageUrl { get; set; }
    public bool IsFree { get; set; }
    [StringLength(20)] public string ContentType { get; set; } = "ARTICLE";
    [StringLength(500)] public string? VideoUrl { get; set; }
    [StringLength(500)] public string? ThumbnailUrl { get; set; }
}

public sealed class UpdateRecipeRequest
{
    [Range(1, int.MaxValue)] public int CategoryId { get; set; }
    [Required, StringLength(200)] public string Title { get; set; } = string.Empty;
    [Required] public string Ingredients { get; set; } = string.Empty;
    [Required] public string CookingProcedure { get; set; } = string.Empty;
    [StringLength(500)] public string? ImageUrl { get; set; }
    public bool IsFree { get; set; }
    [StringLength(20)] public string ContentType { get; set; } = "ARTICLE";
    [StringLength(500)] public string? VideoUrl { get; set; }
    [StringLength(500)] public string? ThumbnailUrl { get; set; }
}

public sealed class TipDto
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
    public string AccessLevel { get; set; } = "FULL";
    public bool IsContentTruncated { get; set; }
}

public sealed class CreateTipRequest
{
    [Required, StringLength(200)] public string Title { get; set; } = string.Empty;
    [Required] public string Content { get; set; } = string.Empty;
    public bool IsFree { get; set; }
    [StringLength(500)] public string? VideoUrl { get; set; }
}

public sealed class UpdateTipRequest
{
    [Required, StringLength(200)] public string Title { get; set; } = string.Empty;
    [Required] public string Content { get; set; } = string.Empty;
    public bool IsFree { get; set; }
    [StringLength(500)] public string? VideoUrl { get; set; }
}

public sealed class CategoryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int RecipeCount { get; set; }
}

public sealed class FaqDto
{
    public int FaqId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public sealed record CatalogActor(
    int? UserId,
    string? Role,
    string? DisplayName,
    string? AuthorizationHeader)
{
    public bool IsAdmin => string.Equals(Role, "ADMIN", StringComparison.OrdinalIgnoreCase);
    public bool IsMember => string.Equals(Role, "MEMBER", StringComparison.OrdinalIgnoreCase);
}
