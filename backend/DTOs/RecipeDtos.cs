using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// Recipe view DTO with author and category details.
    /// </summary>
    public class RecipeDto
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
        public int ShareCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int FeedbackCount { get; set; }
    }

    /// <summary>
    /// Request DTO for publishing a new recipe.
    /// Ingredients and CookingProcedure are mandatory per SRS requirements.
    /// </summary>
    public class CreateRecipeRequest
    {
        [Required(ErrorMessage = "Category ID is required.")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Recipe title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ingredients list is required.")]
        public string Ingredients { get; set; } = string.Empty;

        [Required(ErrorMessage = "Cooking procedure is required.")]
        public string CookingProcedure { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Image URL cannot exceed 500 characters.")]
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Controls whether the recipe is accessible to guest users.
        /// Admin can choose free or members-only; Members default to false (members-only).
        /// </summary>
        public bool IsFree { get; set; } = false;

        public string ContentType { get; set; } = "ARTICLE";

        [StringLength(500, ErrorMessage = "Video URL cannot exceed 500 characters.")]
        public string? VideoUrl { get; set; }

        [StringLength(500, ErrorMessage = "Thumbnail URL cannot exceed 500 characters.")]
        public string? ThumbnailUrl { get; set; }
    }

    /// <summary>
    /// Request DTO for updating an existing recipe.
    /// </summary>
    public class UpdateRecipeRequest
    {
        [Required(ErrorMessage = "Category ID is required.")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Recipe title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ingredients list is required.")]
        public string Ingredients { get; set; } = string.Empty;

        [Required(ErrorMessage = "Cooking procedure is required.")]
        public string CookingProcedure { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Image URL cannot exceed 500 characters.")]
        public string? ImageUrl { get; set; }

        public bool IsFree { get; set; } = false;

        public string ContentType { get; set; } = "ARTICLE";

        [StringLength(500, ErrorMessage = "Video URL cannot exceed 500 characters.")]
        public string? VideoUrl { get; set; }

        [StringLength(500, ErrorMessage = "Thumbnail URL cannot exceed 500 characters.")]
        public string? ThumbnailUrl { get; set; }
    }
}

