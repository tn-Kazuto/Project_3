using System.Net;
using System.Net.Mail;
using JamesThew.Shared.Contracts.Events;

namespace JamesThew.NotificationService.Services;

public interface IEmailDispatcher
{
    Task SendMembershipActivatedAsync(SubscriptionActivatedEvent message, CancellationToken cancellationToken);
    Task SendContestWinnerAsync(ContestWinnerAnnouncedEvent message, CancellationToken cancellationToken);
}

/// <summary>Sends event-driven email when SMTP is configured; otherwise records the skipped delivery.</summary>
public sealed class EmailDispatcher(IConfiguration configuration, ILogger<EmailDispatcher> logger) : IEmailDispatcher
{
    public Task SendMembershipActivatedAsync(SubscriptionActivatedEvent message, CancellationToken cancellationToken) =>
        SendAsync(message.Email,
            "Your Chef James Thew membership is active",
            $"<p>Your {WebUtility.HtmlEncode(message.PlanType)} membership is active.</p><p>Amount: ${message.Amount:N2}</p>",
            cancellationToken);

    public Task SendContestWinnerAsync(ContestWinnerAnnouncedEvent message, CancellationToken cancellationToken) =>
        SendAsync(message.WinnerEmail,
            $"Congratulations: {message.ContestTitle}",
            $"<p>Congratulations, {WebUtility.HtmlEncode(message.WinnerName)}.</p><p>You won {WebUtility.HtmlEncode(message.ContestTitle)}.</p><p>{WebUtility.HtmlEncode(message.PrizeDetails)}</p>",
            cancellationToken);

    private async Task SendAsync(string recipient, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        var host = configuration["Smtp:Host"];
        if (string.IsNullOrWhiteSpace(recipient) || string.IsNullOrWhiteSpace(host) ||
            !int.TryParse(configuration["Smtp:Port"], out var port))
        {
            logger.LogInformation("SMTP is not configured; skipped {Subject} email to {Recipient}", subject, recipient);
            return;
        }

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = configuration.GetValue("Smtp:EnableSsl", true),
            Timeout = 10000
        };

        var username = configuration["Smtp:Username"];
        var password = configuration["Smtp:Password"];
        if (!string.IsNullOrWhiteSpace(username))
        {
            client.Credentials = new System.Net.NetworkCredential(username, password);
        }

        using var mail = new MailMessage
        {
            From = new MailAddress(
                configuration["Smtp:FromEmail"] ?? "concierge@jamesthew-culinary.com",
                configuration["Smtp:FromName"] ?? "Chef James Thew Culinary Atelier"),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        mail.To.Add(recipient);
        try
        {
            await client.SendMailAsync(mail, cancellationToken);
            logger.LogInformation("Dispatched {Subject} email to {Recipient}", subject, recipient);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogError(exception, "Could not deliver {Subject} email to {Recipient}", subject, recipient);
        }
    }
}
