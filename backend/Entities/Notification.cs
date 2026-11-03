using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents an in-app notification delivered to a user's notification bell.
    /// Triggers for contest announcements, new recipes, liveshows, and subscription renewals.
    /// </summary>
    public class Notification
    {
        /// <summary>Primary key. Auto-incremented notification identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NotificationId { get; set; }

        /// <summary>Foreign key referencing the recipient user.</summary>
        [Required]
        public int UserId { get; set; }

        /// <summary>Headline / title of the notification.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>Detailed message body.</summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Message { get; set; } = string.Empty;

        /// <summary>Optional relative or absolute link for in-app navigation upon clicking.</summary>
        [MaxLength(500)]
        public string? TargetUrl { get; set; }

        /// <summary>Whether the notification has been read by the user.</summary>
        [Required]
        public bool IsRead { get; set; } = false;

        /// <summary>Timestamp of when the notification was created.</summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──

        /// <summary>The recipient user of this notification.</summary>
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}
