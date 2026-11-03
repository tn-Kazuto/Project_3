using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// User profile response DTO.
    /// </summary>
    public class UserDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Role { get; set; } = string.Empty;
        public string? SubscriptionPlan { get; set; }
        public decimal? SubscriptionAmount { get; set; }
        public DateTime? SubscriptionStart { get; set; }
        public DateTime? SubscriptionEnd { get; set; }
        public bool IsSubscriptionActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Profile update request DTO.
    /// Per SRS: Users can update their profile information on the user profile page.
    /// </summary>
    public class UpdateProfileRequest
    {
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters.")]
        public string FullName { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(20)]
        public string? Phone { get; set; }
    }

    /// <summary>
    /// Password change request DTO.
    /// </summary>
    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "Current password is required.")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "New password is required.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "New password must be at least 6 characters long.")]
        public string NewPassword { get; set; } = string.Empty;

        [Compare("NewPassword", ErrorMessage = "New password and confirmation do not match.")]
        public string? ConfirmNewPassword { get; set; }
    }

    /// <summary>
    /// Subscription renewal or tier upgrade request DTO.
    /// Per SRS: Members can renew or upgrade their subscription plan ($10/month or $100/year).
    /// </summary>
    public class RenewSubscriptionRequest
    {
        [Required(ErrorMessage = "Plan type is required (MONTHLY or YEARLY).")]
        public string PlanType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Cardholder name is required.")]
        public string CardHolderName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Card number is required.")]
        public string CardNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Card expiry date is required.")]
        public string ExpiryDate { get; set; } = string.Empty;

        [Required(ErrorMessage = "CVV is required.")]
        public string Cvv { get; set; } = string.Empty;
    }
}

