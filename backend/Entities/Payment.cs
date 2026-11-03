using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Records a subscription payment transaction for a member.
    /// Each payment corresponds to a MONTHLY or YEARLY subscription purchase.
    /// </summary>
    public class Payment
    {
        /// <summary>Primary key. Auto-incremented payment identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PaymentId { get; set; }

        /// <summary>Foreign key referencing the user who made this payment.</summary>
        [Required]
        public int UserId { get; set; }

        /// <summary>
        /// Subscription plan type purchased in this transaction.
        /// Valid values: "MONTHLY" or "YEARLY".
        /// </summary>
        [Required]
        [MaxLength(10)]
        public string PlanType { get; set; } = string.Empty;

        /// <summary>
        /// Payment amount in USD. Expected values: 10.00 (monthly) or 100.00 (yearly).
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        /// <summary>Date and time when the payment was processed.</summary>
        [Required]
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Current status of the payment transaction.
        /// Valid values: "COMPLETED", "PENDING", or "FAILED".
        /// </summary>
        [Required]
        [MaxLength(15)]
        public string Status { get; set; } = "PENDING";

        // ── Navigation Properties ──

        /// <summary>The user who made this payment.</summary>
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}
