using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a cooking recipe published on the website.
    /// Recipes can be free (accessible to all) or premium (subscribers only).
    /// </summary>
    public class Recipe
    {
        /// <summary>Primary key. Auto-incremented recipe identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RecipeId { get; set; }

        /// <summary>Foreign key referencing the user who authored this recipe.</summary>
        [Required]
        public int AuthorId { get; set; }

        /// <summary>Foreign key referencing the category this recipe belongs to.</summary>
        [Required]
        public int CategoryId { get; set; }

        /// <summary>Title of the recipe.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Full list of ingredients required for the recipe.
        /// Stored as TEXT to accommodate lengthy ingredient lists.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Ingredients { get; set; } = string.Empty;

        /// <summary>
        /// Step-by-step cooking procedure / instructions.
        /// Stored as TEXT to accommodate detailed multi-step procedures.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string CookingProcedure { get; set; } = string.Empty;

        /// <summary>Optional URL pointing to an image of the finished dish.</summary>
        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Indicates whether the recipe is freely accessible.
        /// True = visible to everyone; False = premium (subscribers only).
        /// </summary>
        [Required]
        public bool IsFree { get; set; } = true;

        /// <summary>
        /// Content classification type according to SRS v2.0.
        /// Valid values: "ARTICLE", "VIDEO", "TALKSHOW", "LIVESHOW".
        /// Defaults to "ARTICLE".
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string ContentType { get; set; } = "ARTICLE";

        /// <summary>Optional URL pointing to an instructional video or broadcast stream.</summary>
        [MaxLength(500)]
        public string? VideoUrl { get; set; }

        /// <summary>Optional URL pointing to a thumbnail image for video/talkshow/liveshow.</summary>
        [MaxLength(500)]
        public string? ThumbnailUrl { get; set; }

        /// <summary>Number of times this recipe has been shared to Facebook or external networks.</summary>
        public int ShareCount { get; set; } = 0;

        /// <summary>Timestamp of when the recipe was first published.</summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Timestamp of the most recent edit. Null if never edited.</summary>
        public DateTime? UpdatedAt { get; set; }

        // ── Navigation Properties ──

        /// <summary>The user who authored this recipe.</summary>
        [ForeignKey("AuthorId")]
        public User Author { get; set; } = null!;

        /// <summary>The category this recipe belongs to.</summary>
        [ForeignKey("CategoryId")]
        public Category Category { get; set; } = null!;

        /// <summary>Feedback / comments left on this recipe.</summary>
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
    }
}

