namespace backend.Services
{
    /// <summary>
    /// Dual-mode email service for transactional notifications, membership receipts, and contest winner alerts.
    /// Operates in SMTP mode or structured fallback logger mode.
    /// </summary>
    public interface IEmailService
    {
        /// <summary>Sends a generic transactional email or records it to logger.</summary>
        Task<bool> SendEmailAsync(string toEmail, string subject, string bodyHtml);

        /// <summary>Sends a luxury branded welcome receipt for VIP pass membership.</summary>
        Task<bool> SendWelcomeMembershipEmailAsync(string toEmail, string memberName, string planName, decimal amount);

        /// <summary>Sends a winner notification email for culinary contest champions.</summary>
        Task<bool> SendContestWinnerAnnouncementEmailAsync(string toEmail, string memberName, string contestTitle, string recipeTitle);
    }
}

