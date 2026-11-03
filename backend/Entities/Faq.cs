using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a Frequently Asked Question displayed on the website.
    /// FAQs are ordered by DisplayOrder for consistent presentation.
    /// </summary>
    public class Faq
    {
        /// <summary>Primary key. Auto-incremented FAQ identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FaqId { get; set; }

        /// <summary>The question text displayed to users.</summary>
        [Required]
        [MaxLength(500)]
        public string Question { get; set; } = string.Empty;

        /// <summary>
        /// The answer text displayed when the question is expanded.
        /// Stored as TEXT to accommodate detailed answers.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Answer { get; set; } = string.Empty;

        /// <summary>
        /// Sort order for displaying FAQs on the page.
        /// Lower values appear first.
        /// </summary>
        [Required]
        public int DisplayOrder { get; set; }
    }
}
