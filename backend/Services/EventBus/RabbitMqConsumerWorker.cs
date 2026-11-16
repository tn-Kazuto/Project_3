using System.Text;
using System.Text.Json;
using JamesThew.Shared.Contracts.Events;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace backend.Services.EventBus
{
    /// <summary>
    /// Background service that consumes domain events from RabbitMQ queues.
    /// Demonstrates the asynchronous Event-Driven consumer pattern in Microservices.
    /// </summary>
    public class RabbitMqConsumerWorker : BackgroundService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<RabbitMqConsumerWorker> _logger;
        private readonly IServiceProvider _serviceProvider;
        private IConnection? _connection;
        private IChannel? _channel;

        public const string ExchangeName = "jamesthew.events";
        public const string SubscriptionQueue = "jamesthew.subscription.queue";
        public const string ContestQueue = "jamesthew.contest.queue";

        public RabbitMqConsumerWorker(
            IConfiguration config,
            ILogger<RabbitMqConsumerWorker> logger,
            IServiceProvider serviceProvider)
        {
            _config = config;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var isEnabled = _config.GetValue<bool>("RabbitMQ:Enabled", true);
            if (!isEnabled)
            {
                _logger.LogInformation("RabbitMQ consumer is disabled in configuration.");
                return;
            }

            // Retry loop to connect to RabbitMQ broker gracefully
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var factory = new ConnectionFactory
                    {
                        HostName = _config["RabbitMQ:HostName"] ?? "localhost",
                        Port = int.TryParse(_config["RabbitMQ:Port"], out var p) ? p : 5672,
                        UserName = _config["RabbitMQ:UserName"] ?? string.Empty,
                        Password = _config["RabbitMQ:Password"] ?? string.Empty
                    };

                    _logger.LogInformation("RabbitMQ Worker initializing connection to {Host}:{Port}...", factory.HostName, factory.Port);
                    _connection = await factory.CreateConnectionAsync(stoppingToken);
                    _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);

                    // 1. Declare Topic Exchange
                    await _channel.ExchangeDeclareAsync(
                        exchange: ExchangeName,
                        type: ExchangeType.Topic,
                        durable: true,
                        autoDelete: false,
                        cancellationToken: stoppingToken
                    );

                    // 2. Setup Subscription Queue
                    await _channel.QueueDeclareAsync(
                        queue: SubscriptionQueue,
                        durable: true,
                        exclusive: false,
                        autoDelete: false,
                        arguments: null,
                        cancellationToken: stoppingToken
                    );
                    await _channel.QueueBindAsync(
                        queue: SubscriptionQueue,
                        exchange: ExchangeName,
                        routingKey: "subscription.*",
                        cancellationToken: stoppingToken
                    );

                    // 3. Setup Contest Queue
                    await _channel.QueueDeclareAsync(
                        queue: ContestQueue,
                        durable: true,
                        exclusive: false,
                        autoDelete: false,
                        arguments: null,
                        cancellationToken: stoppingToken
                    );
                    await _channel.QueueBindAsync(
                        queue: ContestQueue,
                        exchange: ExchangeName,
                        routingKey: "contest.*",
                        cancellationToken: stoppingToken
                    );

                    _logger.LogInformation("RabbitMQ Worker declared queues [{SubQueue}, {ContestQueue}] bound to exchange [{Exchange}]",
                        SubscriptionQueue, ContestQueue, ExchangeName);

                    // 4. Register Consumers
                    await StartConsumerAsync(SubscriptionQueue, stoppingToken);
                    await StartConsumerAsync(ContestQueue, stoppingToken);

                    _logger.LogInformation("RabbitMQ Worker started listening to messages successfully.");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("RabbitMQ Worker could not connect: {Message}. Retrying in 10 seconds...", ex.Message);
                    try
                    {
                        await Task.Delay(10000, stoppingToken);
                    }
                    catch (OperationCanceledException)
                    {
                        break;
                    }
                }
            }
        }

        private async Task StartConsumerAsync(string queueName, CancellationToken stoppingToken)
        {
            if (_channel == null) return;

            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (sender, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var routingKey = ea.RoutingKey;

                _logger.LogInformation(
                    "📥 [RabbitMQ Consumer] Received event from Queue [{Queue}] with RoutingKey [{Key}]:\n{Payload}",
                    queueName, routingKey, message);

                try
                {
                    // Process events based on routing key
                    if (routingKey == "contest.announced")
                    {
                        var announcedEvent = JsonSerializer.Deserialize<ContestWinnerAnnouncedEvent>(message);
                        if (announcedEvent != null)
                        {
                            _logger.LogInformation(
                                "🏆 [Event-Driven Processor] Contest winner processed! Winner: {Winner} ({Email}) for Contest '{Title}' - Prize: {Prize}",
                                announcedEvent.WinnerName, announcedEvent.WinnerEmail, announcedEvent.ContestTitle, announcedEvent.PrizeDetails);
                        }
                    }
                    else if (routingKey == "subscription.activated")
                    {
                        var subEvent = JsonSerializer.Deserialize<SubscriptionActivatedEvent>(message);
                        if (subEvent != null)
                        {
                            await ApplySubscriptionProjectionAsync(subEvent, stoppingToken);
                            _logger.LogInformation(
                                "💳 [Event-Driven Processor] Subscription payment processed! User: {UserId} ({Email}) - Plan: {Plan} (${Amount})",
                                subEvent.UserId, subEvent.Email, subEvent.PlanType, subEvent.Amount);
                        }
                    }
                    else if (routingKey == "subscription.expired")
                    {
                        var expiredEvent = JsonSerializer.Deserialize<SubscriptionExpiredEvent>(message);
                        if (expiredEvent != null)
                        {
                            await ApplySubscriptionExpiryAsync(expiredEvent, stoppingToken);
                        }
                    }

                    // Acknowledge receipt
                    await _channel.BasicAckAsync(ea.DeliveryTag, multiple: false, cancellationToken: stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing message from RabbitMQ queue {Queue}", queueName);
                    // Requeue or Nack if necessary
                    var retrySubscriptionEvent = routingKey.StartsWith("subscription.", StringComparison.Ordinal);
                    await _channel.BasicNackAsync(
                        ea.DeliveryTag,
                        multiple: false,
                        requeue: retrySubscriptionEvent,
                        cancellationToken: stoppingToken);
                }
            };

            await _channel.BasicConsumeAsync(
                queue: queueName,
                autoAck: false,
                consumer: consumer,
                cancellationToken: stoppingToken
            );
        }

        private async Task ApplySubscriptionProjectionAsync(
            SubscriptionActivatedEvent message,
            CancellationToken cancellationToken)
        {
            await using var scope = _serviceProvider.CreateAsyncScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<backend.Data.ApplicationDbContext>();
            var user = await dbContext.Users.FindAsync([message.UserId], cancellationToken);
            if (user is null || (user.SubscriptionEnd.HasValue && user.SubscriptionEnd.Value >= message.EndDate))
            {
                return;
            }

            user.SubscriptionPlan = message.PlanType;
            user.SubscriptionAmount = message.Amount;
            user.SubscriptionStart = message.StartDate;
            user.SubscriptionEnd = message.EndDate;
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        private async Task ApplySubscriptionExpiryAsync(
            SubscriptionExpiredEvent message,
            CancellationToken cancellationToken)
        {
            await using var scope = _serviceProvider.CreateAsyncScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<backend.Data.ApplicationDbContext>();
            var user = await dbContext.Users.FindAsync([message.UserId], cancellationToken);
            if (user is null || user.SubscriptionEnd is null || user.SubscriptionEnd.Value > message.ExpiredAt)
            {
                return;
            }

            user.SubscriptionEnd = message.ExpiredAt;
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Stopping RabbitMQ Consumer Worker...");
            if (_channel != null)
            {
                await _channel.CloseAsync(cancellationToken);
                _channel.Dispose();
            }

            if (_connection != null)
            {
                await _connection.CloseAsync(cancellationToken);
                _connection.Dispose();
            }

            await base.StopAsync(cancellationToken);
        }
    }
}

