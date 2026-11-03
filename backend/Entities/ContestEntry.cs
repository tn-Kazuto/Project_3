using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a submission entry to a contest.
    /// Entries can be submitted by registered members or by guests (with name/email).
    /// Content fields vary depending on the contest type (RECIPE vs TIP).
    /// </summary>
    public class ContestEntry
    {
        /// <summary>Primary key. Auto-incremented entry identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EntryId { get; set; }

        /// <summary>Foreign key referencing the contest this entry belongs to.</summary>
        [Required]
        public int ContestId { get; set; }

        /// <summary>
        /// Foreign key referencing the registered user who submitted this entry.
        /// Null when the entry is submitted by a guest.
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>Display name of the guest submitter. Null for registered users.</summary>
        [MaxLength(100)]
        public string? GuestName { get; set; }

        /// <summary>Email of the guest submitter. Null for registered users.</summary>
        [MaxLength(150)]
        public string? GuestEmail { get; set; }

        /// <summary>Title of the contest entry submission.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Ingredients list for recipe-type contest entries.
        /// Null for tip-type contest entries.
        /// </summary>
        [Column(TypeName = "TEXT")]
        public string? Ingredients { get; set; }

        /// <summary>
        /// Cooking procedure for recipe-type contest entries.
        /// Null for tip-type contest entries.
        /// </summary>
        [Column(TypeName = "TEXT")]
        public string? CookingProcedure { get; set; }

        /// <summary>
        /// Tip content for tip-type contest entries.
        /// Null for recipe-type contest entries.
        /// </summary>
        [Column(TypeName = "TEXT")]
        public string? TipContent { get; set; }

        /// <summary>Timestamp of when the entry was submitted.</summary>
        [Required]
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Whether this entry has been selected as a winner of the contest.
        /// Defaults to false until the admin declares a winner.
        /// </summary>
        [Required]
        public bool IsWinner { get; set; } = false;

        /// <summary>Total community votes cast for this entry.</summary>
        public int VoteCount { get; set; } = 0;

        // ── Navigation Properties ──

        /// <summary>The contest this entry was submitted to.</summary>
        [ForeignKey("ContestId")]
        public Contest Contest { get; set; } = null!;

        /// <summary>
        /// The registered user who submitted this entry.
        /// Null when the entry was submitted by a guest.
        /// </summary>
        [ForeignKey("UserId")]
        public User? User { get; set; }

        /// <summary>Individual votes cast for this contest entry.</summary>
        public ICollection<ContestVote> Votes { get; set; } = new List<ContestVote>();
    }
}
