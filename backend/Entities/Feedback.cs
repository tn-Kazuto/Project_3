using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents feedback or a comment submitted on a recipe or the website in general.
    /// Feedback can come from registered users or anonymous guests.
    /// </summary>
    public class Feedback
    {
        /// <summary>Primary key. Auto-incremented feedback identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FeedbackId { get; set; }

        /// <summary>
        /// Optional foreign key referencing the recipe this feedback is about.
        /// Null for general website feedback not tied to a specific recipe.
        /// </summary>
        public int? RecipeId { get; set; }

        /// <summary>
        /// Optional foreign key referencing the registered user who left feedback.
        /// Null when feedback is submitted by a guest.
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>Name of the person who submitted the feedback.</summary>
        [Required]
        [MaxLength(100)]
        public string SenderName { get; set; } = string.Empty;

        /// <summary>Email of the person who submitted the feedback.</summary>
        [Required]
        [MaxLength(150)]
        public string SenderEmail { get; set; } = string.Empty;

        /// <summary>
        /// The feedback comment / message body.
        /// Stored as TEXT to accommodate lengthy comments.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Comment { get; set; } = string.Empty;

        /// <summary>Optional URL pointing to user practice image/video demonstrating recipe results.</summary>
        [MaxLength(500)]
        public string? MediaUrl { get; set; }

        /// <summary>Optional star rating for the recipe (1 to 5 stars).</summary>
        public int? Rating { get; set; }

        /// <summary>Timestamp of when the feedback was submitted.</summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──

        /// <summary>
        /// The recipe this feedback is associated with, if any.
        /// Null for general website feedback.
        /// </summary>
        [ForeignKey("RecipeId")]
        public Recipe? Recipe { get; set; }

        /// <summary>
        /// The registered user who submitted this feedback, if any.
        /// Null for guest feedback.
        /// </summary>
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
