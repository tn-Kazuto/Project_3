using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a registered user of the James Thew Cooking Website.
    /// Users can be either Admins (site managers) or Members (subscribers).
    /// Members must have an active subscription to access premium content.
    /// </summary>
    public class User
    {
        /// <summary>Primary key. Auto-incremented user identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        /// <summary>Unique login name chosen by the user.</summary>
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        /// <summary>BCrypt-hashed password. Never stored in plain text.</summary>
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>User's full display name.</summary>
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        /// <summary>Unique email address used for account verification and notifications.</summary>
        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        /// <summary>Optional phone number for contact purposes.</summary>
        [MaxLength(20)]
        public string? Phone { get; set; }

        /// <summary>
        /// User role controlling access level.
        /// Valid values: "ADMIN" (full site management) or "MEMBER" (subscriber).
        /// </summary>
        [Required]
        [MaxLength(10)]
        public string Role { get; set; } = "MEMBER";

        /// <summary>
        /// Subscription tier for members. Null for Admin users.
        /// Valid values: "MONTHLY" or "YEARLY".
        /// </summary>
        [MaxLength(10)]
        public string? SubscriptionPlan { get; set; }

        /// <summary>
        /// Monetary amount paid for the current subscription period.
        /// 10.00 for MONTHLY, 100.00 for YEARLY. Null for Admin users.
        /// </summary>
        [Column(TypeName = "decimal(10,2)")]
        public decimal? SubscriptionAmount { get; set; }

        /// <summary>Date and time when the current subscription period began.</summary>
        public DateTime? SubscriptionStart { get; set; }

        /// <summary>Date and time when the current subscription period expires.</summary>
        public DateTime? SubscriptionEnd { get; set; }

        /// <summary>Timestamp of when the user account was created.</summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Optional URL pointing to user avatar image.</summary>
        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        /// <summary>Whether user's email has been verified.</summary>
        public bool IsEmailVerified { get; set; } = true;

        // ── Navigation Properties ──

        /// <summary>Recipes authored by this user.</summary>
        public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();

        /// <summary>Tips authored by this user.</summary>
        public ICollection<Tip> Tips { get; set; } = new List<Tip>();

        /// <summary>Payment transactions associated with this user's subscriptions.</summary>
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        /// <summary>Notifications delivered to this user.</summary>
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        /// <summary>Contest votes cast by this user.</summary>
        public ICollection<ContestVote> ContestVotes { get; set; } = new List<ContestVote>();
    }
}

