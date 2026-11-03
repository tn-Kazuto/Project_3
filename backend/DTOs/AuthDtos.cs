using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// Registration request with mandatory subscription plan and mock payment details.
    /// Per SRS: Customers can only register after choosing a subscription ($10/month or $100/year) and making payment.
    /// </summary>
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; } = string.Empty;

        [Compare("Password", ErrorMessage = "Password and confirmation password do not match.")]
        public string? ConfirmPassword { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(20)]
        public string? Phone { get; set; }

        /// <summary>
        /// Selected subscription plan. Must be "MONTHLY" ($10) or "YEARLY" ($100).
        /// </summary>
        [Required(ErrorMessage = "Subscription plan is required (MONTHLY or YEARLY).")]
        public string PlanType { get; set; } = string.Empty;

        /// <summary>Mock payment cardholder name.</summary>
        [Required(ErrorMessage = "Cardholder name is required.")]
        public string CardHolderName { get; set; } = string.Empty;

        /// <summary>Mock credit card number (16 digits or mock test format).</summary>
        [Required(ErrorMessage = "Card number is required.")]
        public string CardNumber { get; set; } = string.Empty;

        /// <summary>Card expiry date (MM/YY).</summary>
        [Required(ErrorMessage = "Card expiry date is required.")]
        public string ExpiryDate { get; set; } = string.Empty;

        /// <summary>Card CVV/CVC code (3-4 digits).</summary>
        [Required(ErrorMessage = "CVV is required.")]
        public string Cvv { get; set; } = string.Empty;
    }

    /// <summary>
    /// Login request DTO supporting login via email or username.
    /// </summary>
    public class LoginRequest
    {
        [Required(ErrorMessage = "Email or username is required.")]
        public string EmailOrUsername { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// Authentication response returned upon successful registration or login.
    /// </summary>
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserDto User { get; set; } = null!;
    }
}

