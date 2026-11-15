using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a cryptographic refresh token for renewing short-lived JWT access tokens.
    /// Handled via secure HttpOnly cookies to protect against XSS and credential theft.
    /// </summary>
    public class RefreshToken
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RefreshTokenId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(256)]
        public string Token { get; set; } = string.Empty;

        [Required]
        public DateTime ExpiresAt { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string? CreatedByIp { get; set; }

        public DateTime? RevokedAt { get; set; }

        [MaxLength(50)]
        public string? RevokedByIp { get; set; }

        [MaxLength(256)]
        public string? ReplacedByToken { get; set; }

        [NotMapped]
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

        [NotMapped]
        public bool IsRevoked => RevokedAt != null;

        [NotMapped]
        public bool IsActive => !IsRevoked && !IsExpired;

        // Navigation property
        public virtual User User { get; set; } = null!;
    }
}

