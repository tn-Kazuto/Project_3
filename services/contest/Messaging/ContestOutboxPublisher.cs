using System.Text;
using JamesThew.ContestService.Data;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;

namespace JamesThew.ContestService.Messaging;

public sealed class ContestOutboxPublisher(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<ContestOutboxPublisher> logger) : BackgroundService
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
                var options = new CreateChannelOptions(true, true);
                await using var channel = await connection.CreateChannelAsync(options, stoppingToken);
                await channel.ExchangeDeclareAsync(ExchangeName, ExchangeType.Topic, true, false, cancellationToken: stoppingToken);
                logger.LogInformation("Contest outbox publisher connected to RabbitMQ.");

                while (!stoppingToken.IsCancellationRequested)
                {
                    var count = await PublishBatchAsync(channel, stoppingToken);
                    if (count == 0)
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
                logger.LogWarning(exception, "Contest outbox publisher failed; retrying shortly.");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

    private async Task<int> PublishBatchAsync(IChannel channel, CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ContestDbContext>();
        var messages = await dbContext.OutboxMessages.Where(message => message.PublishedAtUtc == null)
            .OrderBy(message => message.CreatedAtUtc).Take(20).ToListAsync(cancellationToken);

        foreach (var message in messages)
        {
            try
            {
                await channel.BasicPublishAsync(
                    ExchangeName,
                    message.RoutingKey,
                    mandatory: true,
                    basicProperties: new BasicProperties
                    {
                        ContentType = "application/json",
                        DeliveryMode = DeliveryModes.Persistent,
                        MessageId = message.OutboxMessageId.ToString()
                    },
                    body: Encoding.UTF8.GetBytes(message.Payload),
                    cancellationToken: cancellationToken);
                message.PublishedAtUtc = DateTime.UtcNow;
                message.LastError = null;
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                message.AttemptCount++;
                message.LastError = exception.Message.Length > 1000 ? exception.Message[..1000] : exception.Message;
                await dbContext.SaveChangesAsync(cancellationToken);
                logger.LogWarning(exception, "Failed to publish contest outbox message {OutboxMessageId}.", message.OutboxMessageId);
                throw;
            }
        }

        return messages.Count;
    }
}
