using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a community vote cast for a contest entry.
    /// Supports authenticated members and guests with IP/email fraud-prevention tracking.
    /// </summary>
    public class ContestVote
    {
        /// <summary>Primary key. Auto-incremented vote identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int VoteId { get; set; }

        /// <summary>Foreign key referencing the contest entry being voted for.</summary>
        [Required]
        public int ContestEntryId { get; set; }

        /// <summary>
        /// Foreign key referencing the registered user who voted.
        /// Null when vote is cast by a guest.
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>
        /// Voter's email or IP address for fraud detection and duplicate-prevention.
        /// </summary>
        [Required]
        [MaxLength(150)]
        public string VoterIpOrEmail { get; set; } = string.Empty;

        /// <summary>Timestamp of when the vote was cast.</summary>
        [Required]
        public DateTime VotedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──

        /// <summary>The contest entry that received this vote.</summary>
        [ForeignKey("ContestEntryId")]
        public ContestEntry ContestEntry { get; set; } = null!;

        /// <summary>The registered user who cast this vote, if authenticated.</summary>
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}

