using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a cooking tip or advice article published on the website.
    /// Tips can be free (accessible to all) or premium (subscribers only).
    /// </summary>
    public class Tip
    {
        /// <summary>Primary key. Auto-incremented tip identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TipId { get; set; }

        /// <summary>Foreign key referencing the user who authored this tip.</summary>
        [Required]
        public int AuthorId { get; set; }

        /// <summary>Title of the tip.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Full content / body of the tip.
        /// Stored as TEXT to accommodate lengthy advice articles.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Indicates whether the tip is freely accessible.
        /// True = visible to everyone; False = premium (subscribers only).
        /// </summary>
        [Required]
        public bool IsFree { get; set; } = true;

        /// <summary>Optional URL pointing to an instructional video illustrating this tip.</summary>
        [MaxLength(500)]
        public string? VideoUrl { get; set; }

        /// <summary>Timestamp of when the tip was first published.</summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Timestamp of the most recent edit. Null if never edited.</summary>
        public DateTime? UpdatedAt { get; set; }

        // ── Navigation Properties ──

        /// <summary>The user who authored this tip.</summary>
        [ForeignKey("AuthorId")]
        public User Author { get; set; } = null!;
    }
}
