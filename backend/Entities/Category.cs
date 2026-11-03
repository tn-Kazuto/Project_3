using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a recipe category used to organize recipes by cuisine or type.
    /// Examples: Italian, Desserts, Vegan, etc.
    /// </summary>
    public class Category
    {
        /// <summary>Primary key. Auto-incremented category identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CategoryId { get; set; }

        /// <summary>Display name of the category.</summary>
        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        /// <summary>Optional description explaining the category scope.</summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        // ── Navigation Properties ──

        /// <summary>Recipes that belong to this category.</summary>
        public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
    }
}

