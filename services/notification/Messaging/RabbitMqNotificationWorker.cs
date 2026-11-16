using System.Text;
using JamesThew.NotificationService.Services;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace JamesThew.NotificationService.Messaging;

/// <summary>Consumes integration events and delegates notification delivery to the service layer.</summary>
public sealed class RabbitMqNotificationWorker(
    IConfiguration configuration,
    NotificationEventProcessor processor,
    NotificationWorkerStatus workerStatus,
    ILogger<RabbitMqNotificationWorker> logger) : BackgroundService
{
    private const string ExchangeName = "jamesthew.events";
    private const string QueueName = "jamesthew.notification.queue";
    private const string DeadLetterExchange = "jamesthew.notification.dead";
    private const string DeadLetterQueue = "jamesthew.notification.dead.queue";
    private static readonly string[] RoutingKeys =
    [
        "subscription.activated",
        "subscription.expired",
        "contest.announced",
        "recipe.published"
    ];

    private IConnection? _connection;
    private IChannel? _channel;

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
                _connection = await factory.CreateConnectionAsync(stoppingToken);
                var connectionClosed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
                _connection.ConnectionShutdownAsync += (_, _) =>
                {
                    workerStatus.IsReady = false;
                    connectionClosed.TrySetResult();
                    return Task.CompletedTask;
                };
                _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);
                await _channel.ExchangeDeclareAsync(ExchangeName, ExchangeType.Topic, durable: true, cancellationToken: stoppingToken);
                await _channel.ExchangeDeclareAsync(DeadLetterExchange, ExchangeType.Topic, durable: true, cancellationToken: stoppingToken);
                await _channel.QueueDeclareAsync(DeadLetterQueue, durable: true, exclusive: false, autoDelete: false,
                    arguments: null, cancellationToken: stoppingToken);
                await _channel.QueueBindAsync(DeadLetterQueue, DeadLetterExchange, "#", cancellationToken: stoppingToken);
                await _channel.QueueDeclareAsync(QueueName, durable: true, exclusive: false, autoDelete: false,
                    arguments: new Dictionary<string, object?>
                    {
                        ["x-dead-letter-exchange"] = DeadLetterExchange
                    }, cancellationToken: stoppingToken);

                foreach (var routingKey in RoutingKeys)
                {
                    await _channel.QueueBindAsync(QueueName, ExchangeName, routingKey, cancellationToken: stoppingToken);
                }

                await _channel.BasicQosAsync(0, 1, false, stoppingToken);
                var consumerChannel = _channel ?? throw new InvalidOperationException("RabbitMQ channel was not created.");
                var consumer = new AsyncEventingBasicConsumer(consumerChannel);
                consumer.ReceivedAsync += async (_, delivery) =>
                    await HandleDeliveryAsync(consumerChannel, delivery, stoppingToken);
                await consumerChannel.BasicConsumeAsync(QueueName, autoAck: false, consumer, stoppingToken);

                workerStatus.IsReady = true;
                logger.LogInformation("Notification service is consuming integration events from {QueueName}", QueueName);
                await connectionClosed.Task.WaitAsync(stoppingToken);
                await CloseConnectionsAsync();
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                workerStatus.IsReady = false;
                logger.LogError(exception, "Notification event consumer failed; retrying in five seconds");
                await CloseConnectionsAsync();
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

    private async Task HandleDeliveryAsync(IChannel channel, BasicDeliverEventArgs delivery, CancellationToken cancellationToken)
    {
        try
        {
            await processor.ProcessAsync(delivery.RoutingKey, delivery.Body, cancellationToken);
            if (channel.IsOpen)
            {
                await channel.BasicAckAsync(delivery.DeliveryTag, multiple: false, cancellationToken);
            }
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to process notification event {RoutingKey}", delivery.RoutingKey);
            if (channel.IsOpen)
            {
                var isMalformedMessage = exception is System.Text.Json.JsonException;
                await channel.BasicNackAsync(
                    delivery.DeliveryTag,
                    multiple: false,
                    requeue: !isMalformedMessage,
                    cancellationToken);
            }
        }
    }

    private async Task CloseConnectionsAsync()
    {
        workerStatus.IsReady = false;
        if (_channel is not null)
        {
            await _channel.DisposeAsync();
            _channel = null;
        }

        if (_connection is not null)
        {
            await _connection.DisposeAsync();
            _connection = null;
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        await CloseConnectionsAsync();
        await base.StopAsync(cancellationToken);
    }
}

/// <summary>Reports whether the event queue is declared and actively consumed.</summary>
public sealed class NotificationWorkerStatus
{
    public volatile bool IsReady;
    public volatile bool LegacyImportReady;
}
