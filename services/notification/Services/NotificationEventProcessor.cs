using System.Text.Json;
using JamesThew.NotificationService.Data;
using JamesThew.NotificationService.Models;
using JamesThew.Shared.Contracts.Events;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.NotificationService.Services;

/// <summary>Projects integration events into notification records and transactional email.</summary>
public sealed class NotificationEventProcessor(
    NotificationDbContext dbContext,
    NotificationApplicationService notifications,
    IEmailDispatcher emailDispatcher,
    ILogger<NotificationEventProcessor> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    /// <summary>Handles one RabbitMQ event using its routing key and serialized body.</summary>
    public async Task ProcessAsync(string routingKey, ReadOnlyMemory<byte> body, CancellationToken cancellationToken)
    {
        var json = System.Text.Encoding.UTF8.GetString(body.Span);

        switch (routingKey)
        {
            case "subscription.activated":
                await ProcessSubscriptionActivatedAsync(Deserialize<SubscriptionActivatedEvent>(json), cancellationToken);
                break;
            case "subscription.expired":
                await ProcessSubscriptionExpiredAsync(Deserialize<SubscriptionExpiredEvent>(json), cancellationToken);
                break;
            case "contest.announced":
                await ProcessContestWinnerAsync(Deserialize<ContestWinnerAnnouncedEvent>(json), cancellationToken);
                break;
            case "recipe.published":
                await ProcessRecipePublishedAsync(Deserialize<RecipePublishedEvent>(json), cancellationToken);
                break;
            default:
                logger.LogWarning("Ignoring unsupported integration event {RoutingKey}", routingKey);
                break;
        }
    }

    private async Task ProcessSubscriptionActivatedAsync(SubscriptionActivatedEvent message, CancellationToken cancellationToken)
    {
        var recipient = await dbContext.Recipients.FindAsync([message.UserId], cancellationToken);
        if (recipient is null)
        {
            recipient = new NotificationRecipient { UserId = message.UserId };
            dbContext.Recipients.Add(recipient);
        }

        recipient.Email = message.Email;
        recipient.IsActive = true;
        recipient.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        var eventKey = $"subscription.activated:{message.UserId}:{message.Timestamp.Ticks}";
        await AddNotificationsAsync(
            [CreateNotification(message.UserId, "Welcome to Chef James Thew VIP Pass!",
                $"Your {message.PlanType} pass (${message.Amount:N2}) is activated. Enjoy full access to exclusive recipes, masterclasses, and community contests.",
                "/recipes", eventKey)],
            cancellationToken);

        await emailDispatcher.SendMembershipActivatedAsync(message, cancellationToken);
    }

    private async Task ProcessSubscriptionExpiredAsync(SubscriptionExpiredEvent message, CancellationToken cancellationToken)
    {
        var recipient = await dbContext.Recipients.FindAsync([message.UserId], cancellationToken);
        if (recipient is not null)
        {
            recipient.IsActive = false;
            recipient.UpdatedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var eventKey = $"subscription.expired:{message.UserId}:{message.ExpiredAt.Ticks}";
        await AddNotificationsAsync(
            [CreateNotification(message.UserId, "Your VIP pass has expired",
                "Renew your membership to regain access to members-only recipes and masterclasses.",
                "/profile", eventKey)],
            cancellationToken);
    }

    private async Task ProcessContestWinnerAsync(ContestWinnerAnnouncedEvent message, CancellationToken cancellationToken)
    {
        var eventKey = $"contest.announced:{message.ContestId}:{message.WinnerEntryId}";
        var activeUserIds = await dbContext.Recipients.AsNoTracking()
            .Where(recipient => recipient.IsActive)
            .Select(recipient => recipient.UserId)
            .ToListAsync(cancellationToken);

        var notificationsToCreate = activeUserIds.Distinct().Select(userId => CreateNotification(
            userId,
            "A new culinary contest champion has been crowned",
            $"{message.WinnerName} won {message.ContestTitle} with '{message.PrizeDetails}'.",
            "/announcements",
            $"{eventKey}:user:{userId}")).ToList();

        if (message.WinnerUserId is int winnerUserId && activeUserIds.Contains(winnerUserId))
        {
            notificationsToCreate.Add(CreateNotification(
                winnerUserId,
                "Grand Champion Honors!",
                $"Chef James Thew has crowned you the winner of {message.ContestTitle}!",
                "/announcements",
                $"{eventKey}:winner:{winnerUserId}"));
        }

        await AddNotificationsAsync(notificationsToCreate, cancellationToken);
        await emailDispatcher.SendContestWinnerAsync(message, cancellationToken);
    }

    private async Task ProcessRecipePublishedAsync(RecipePublishedEvent message, CancellationToken cancellationToken)
    {
        var eventKey = $"recipe.published:{message.RecipeId}";
        var recipientIds = await dbContext.Recipients.AsNoTracking()
            .Where(recipient => recipient.IsActive && recipient.UserId != message.AuthorId)
            .Select(recipient => recipient.UserId)
            .ToListAsync(cancellationToken);

        var items = recipientIds.Select(userId => CreateNotification(
            userId,
            $"New recipe: {message.Title}",
            $"A new {message.ContentType.ToLowerInvariant()} was added to {message.CategoryName}.",
            $"/recipes/{message.RecipeId}",
            $"{eventKey}:user:{userId}"));

        await AddNotificationsAsync(items, cancellationToken);
    }

    private async Task AddNotificationsAsync(IEnumerable<NotificationRecord> candidates, CancellationToken cancellationToken)
    {
        var candidateList = candidates.ToList();
        var additions = new List<NotificationRecord>();
        foreach (var batch in candidateList.Chunk(500))
        {
            var eventKeys = batch.Select(notification => notification.EventKey!).ToArray();
            var existingKeys = await dbContext.Notifications.AsNoTracking()
                .Where(notification => eventKeys.Contains(notification.EventKey!))
                .Select(notification => notification.EventKey!)
                .ToHashSetAsync(cancellationToken);

            foreach (var candidate in batch)
            {
                if (!existingKeys.Contains(candidate.EventKey!))
                {
                    additions.Add(candidate);
                }
            }
        }

        await notifications.PersistAndPushAsync(additions, cancellationToken);
    }

    private static NotificationRecord CreateNotification(
        int userId,
        string title,
        string message,
        string targetUrl,
        string eventKey) => new()
    {
        UserId = userId,
        Title = title,
        Message = message,
        TargetUrl = targetUrl,
        IsRead = false,
        CreatedAt = DateTime.UtcNow,
        EventKey = eventKey
    };

    private static T Deserialize<T>(string json) where T : class =>
        JsonSerializer.Deserialize<T>(json, JsonOptions)
        ?? throw new JsonException($"Could not deserialize {typeof(T).Name} integration event.");
}
