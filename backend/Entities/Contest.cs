using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a cooking contest hosted on the website.
    /// Contests can accept either recipe or tip submissions from members and guests.
    /// </summary>
    public class Contest
    {
        /// <summary>Primary key. Auto-incremented contest identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ContestId { get; set; }

        /// <summary>Title / name of the contest.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Detailed description of the contest rules and theme.
        /// Stored as TEXT to accommodate lengthy descriptions.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Type of submissions accepted by this contest.
        /// Valid values: "RECIPE" or "TIP".
        /// </summary>
        [Required]
        [MaxLength(10)]
        public string ContestType { get; set; } = string.Empty;

        /// <summary>Date and time when the contest opens for submissions.</summary>
        [Required]
        public DateTime StartDate { get; set; }

        /// <summary>Date and time when the contest closes for submissions.</summary>
        [Required]
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Whether the contest is currently active and visible on the site.
        /// Defaults to true upon creation.
        /// </summary>
        [Required]
        public bool IsActive { get; set; } = true;

        /// <summary>Foreign key referencing the admin user who created this contest.</summary>
        [Required]
        public int CreatedBy { get; set; }

        // ── Navigation Properties ──

        /// <summary>The admin user who created this contest.</summary>
        [ForeignKey("CreatedBy")]
        public User Creator { get; set; } = null!;

        /// <summary>All submissions / entries for this contest.</summary>
        public ICollection<ContestEntry> Entries { get; set; } = new List<ContestEntry>();

        /// <summary>Announcements associated with this contest (e.g., winner announcements).</summary>
        public ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
    }
}

