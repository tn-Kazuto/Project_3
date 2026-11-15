using JamesThew.NotificationService.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.NotificationService.Data;

/// <summary>Copies existing notification history and recipient addresses into the service-owned database.</summary>
public sealed class LegacyNotificationImporter(
    NotificationDbContext notificationDb,
    IConfiguration configuration,
    ILogger<LegacyNotificationImporter> logger)
{
    public async Task ImportAsync(CancellationToken cancellationToken)
    {
        const string importKey = "legacy-notifications-v1";
        if (await notificationDb.ImportMarkers.AnyAsync(marker => marker.ImportKey == importKey, cancellationToken))
        {
            logger.LogInformation("Legacy notification history was already imported.");
            return;
        }

        var legacyConnectionString = configuration.GetConnectionString("LegacyConnection");
        if (string.IsNullOrWhiteSpace(legacyConnectionString))
        {
            logger.LogInformation("Legacy notification import skipped because no legacy connection is configured.");
            return;
        }

        await using var connection = new SqlConnection(legacyConnectionString);
        await connection.OpenAsync(cancellationToken);

        var recipients = await ReadRecipientsAsync(connection, cancellationToken);
        var history = await ReadNotificationsAsync(connection, cancellationToken);
        await using var transaction = await notificationDb.Database.BeginTransactionAsync(cancellationToken);

        var existingRecipients = await notificationDb.Recipients.ToDictionaryAsync(item => item.UserId, cancellationToken);
        foreach (var recipient in recipients)
        {
            if (existingRecipients.TryGetValue(recipient.UserId, out var existing))
            {
                existing.Email = recipient.Email;
                existing.IsActive = recipient.IsActive;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                notificationDb.Recipients.Add(recipient);
            }
        }

        var existingEventKeys = await notificationDb.Notifications
            .Where(item => item.EventKey != null)
            .Select(item => item.EventKey!)
            .ToHashSetAsync(cancellationToken);
        var missingHistory = history
            .Where(item => !existingEventKeys.Contains(item.EventKey!))
            .ToList();

        notificationDb.Notifications.AddRange(missingHistory);
        notificationDb.ImportMarkers.Add(new NotificationImportMarker
        {
            ImportKey = importKey,
            CompletedAt = DateTime.UtcNow
        });
        await notificationDb.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        logger.LogInformation("Imported {NotificationCount} legacy notifications and {RecipientCount} recipients",
            missingHistory.Count, recipients.Count);
    }

    private static async Task<List<NotificationRecipient>> ReadRecipientsAsync(
        SqlConnection connection,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT UserId, Email,
                   CASE WHEN Role = 'ADMIN' OR SubscriptionEnd > SYSUTCDATETIME() THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END AS IsActive
            FROM dbo.Users;
            """;

        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var recipients = new List<NotificationRecipient>();
        while (await reader.ReadAsync(cancellationToken))
        {
            recipients.Add(new NotificationRecipient
            {
                UserId = reader.GetInt32(0),
                Email = reader.GetString(1),
                IsActive = reader.GetBoolean(2),
                UpdatedAt = DateTime.UtcNow
            });
        }

        return recipients;
    }

    private static async Task<List<NotificationRecord>> ReadNotificationsAsync(
        SqlConnection connection,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT NotificationId, UserId, Title, Message, TargetUrl, IsRead, CreatedAt
            FROM dbo.Notifications;
            """;

        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var notifications = new List<NotificationRecord>();
        while (await reader.ReadAsync(cancellationToken))
        {
            var legacyId = reader.GetInt32(0);
            notifications.Add(new NotificationRecord
            {
                UserId = reader.GetInt32(1),
                Title = reader.GetString(2),
                Message = reader.GetString(3),
                TargetUrl = reader.IsDBNull(4) ? null : reader.GetString(4),
                IsRead = reader.GetBoolean(5),
                CreatedAt = reader.GetDateTime(6),
                EventKey = $"legacy:{legacyId}"
            });
        }

        return notifications;
    }
}
