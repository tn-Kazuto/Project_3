using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a site-wide or contest-specific announcement.
    /// Used to publish contest winner declarations and general news.
    /// </summary>
    public class Announcement
    {
        /// <summary>Primary key. Auto-incremented announcement identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AnnouncementId { get; set; }

        /// <summary>
        /// Optional foreign key referencing the associated contest.
        /// Null for general (non-contest) announcements.
        /// </summary>
        public int? ContestId { get; set; }

        /// <summary>
        /// Optional foreign key referencing the winning contest entry.
        /// Null for non-winner announcements.
        /// </summary>
        public int? WinnerEntryId { get; set; }

        /// <summary>Title / headline of the announcement.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Full body content of the announcement.
        /// Stored as TEXT to accommodate lengthy content.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Content { get; set; } = string.Empty;

        /// <summary>Date and time when the announcement was published.</summary>
        [Required]
        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Indicates whether automated notifications / emails have been dispatched for this announcement.</summary>
        public bool IsEmailSent { get; set; } = false;

        // ── Navigation Properties ──

        /// <summary>
        /// The contest associated with this announcement, if any.
        /// Null for general announcements.
        /// </summary>
        [ForeignKey("ContestId")]
        public Contest? Contest { get; set; }

        /// <summary>
        /// The winning contest entry referenced by this announcement, if any.
        /// </summary>
        [ForeignKey("WinnerEntryId")]
        public ContestEntry? WinnerEntry { get; set; }
    }
}
