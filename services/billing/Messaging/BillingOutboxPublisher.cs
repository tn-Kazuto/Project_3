using System.Text;
using JamesThew.BillingService.Data;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;

namespace JamesThew.BillingService.Messaging;

/// <summary>Publishes committed outbox messages to RabbitMQ and retries unconfirmed messages.</summary>
public sealed class BillingOutboxPublisher(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<BillingOutboxPublisher> logger) : BackgroundService
{
    private const string ExchangeName = "jamesthew.events";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var factory = new ConnectionFactory
        {
            HostName = configuration["RabbitMQ:HostName"] ?? "localhost",
            Port = configuration.GetValue("RabbitMQ:Port", 5672),
            UserName = configuration["RabbitMQ:UserName"] ?? string.Empty,
            Password = configuration["RabbitMQ:Password"] ?? string.Empty
        };

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var connection = await factory.CreateConnectionAsync(stoppingToken);
                var channelOptions = new CreateChannelOptions(
                    publisherConfirmationsEnabled: true,
                    publisherConfirmationTrackingEnabled: true);
                await using var channel = await connection.CreateChannelAsync(channelOptions, stoppingToken);
                await channel.ExchangeDeclareAsync(
                    ExchangeName,
                    ExchangeType.Topic,
                    durable: true,
                    autoDelete: false,
                    cancellationToken: stoppingToken);
                logger.LogInformation("Billing outbox publisher connected to RabbitMQ.");

                while (!stoppingToken.IsCancellationRequested)
                {
                    var published = await PublishBatchAsync(channel, stoppingToken);
                    if (published == 0)
                    {
                        await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
                    }
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogWarning(exception, "Billing outbox publisher failed; retrying shortly.");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

    private async Task<int> PublishBatchAsync(IChannel channel, CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BillingDbContext>();
        var messages = await dbContext.OutboxMessages
            .Where(message => message.PublishedAtUtc == null)
            .OrderBy(message => message.CreatedAtUtc)
            .Take(20)
            .ToListAsync(cancellationToken);

        foreach (var message in messages)
        {
            try
            {
                var properties = new BasicProperties
                {
                    ContentType = "application/json",
                    DeliveryMode = DeliveryModes.Persistent,
                    MessageId = message.OutboxMessageId.ToString("N")
                };
                await channel.BasicPublishAsync(
                    ExchangeName,
                    message.RoutingKey,
                    mandatory: true,
                    basicProperties: properties,
                    body: Encoding.UTF8.GetBytes(message.Payload),
                    cancellationToken: cancellationToken);
                message.PublishedAtUtc = DateTime.UtcNow;
                message.LastError = null;
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                message.AttemptCount++;
                message.LastError = exception.Message.Length > 1000
                    ? exception.Message[..1000]
                    : exception.Message;
                await dbContext.SaveChangesAsync(cancellationToken);
                logger.LogWarning(exception, "Failed to publish billing outbox message {OutboxMessageId}.",
                    message.OutboxMessageId);
                throw;
            }
        }

        return messages.Count;
    }
}
