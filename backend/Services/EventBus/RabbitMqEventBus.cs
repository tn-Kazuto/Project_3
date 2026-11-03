using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace backend.Services.EventBus
{
    /// <summary>
    /// RabbitMQ asynchronous Event Bus implementation using RabbitMQ.Client v7 async API.
    /// Resilient: Gracefully catches connection failures to prevent breaking core user requests.
    /// </summary>
    public class RabbitMqEventBus : IEventBus, IAsyncDisposable
    {
        private readonly IConfiguration _config;
        private readonly ILogger<RabbitMqEventBus> _logger;
        private readonly ConnectionFactory _factory;
        private IConnection? _connection;
        private IChannel? _channel;
        private readonly SemaphoreSlim _lock = new(1, 1);

        public RabbitMqEventBus(IConfiguration config, ILogger<RabbitMqEventBus> logger)
        {
            _config = config;
            _logger = logger;

            _factory = new ConnectionFactory
            {
                HostName = _config["RabbitMQ:HostName"] ?? "localhost",
                Port = int.TryParse(_config["RabbitMQ:Port"], out var p) ? p : 5672,
                UserName = _config["RabbitMQ:UserName"] ?? "admin",
                Password = _config["RabbitMQ:Password"] ?? "Admin@123456"
            };
        }

        private async Task<IChannel?> GetChannelAsync(CancellationToken cancellationToken = default)
        {
            var isEnabled = _config.GetValue<bool>("RabbitMQ:Enabled", true);
            if (!isEnabled) return null;

            if (_channel is { IsOpen: true }) return _channel;

            await _lock.WaitAsync(cancellationToken);
            try
            {
                if (_channel is { IsOpen: true }) return _channel;

                if (_connection is not { IsOpen: true })
                {
                    _logger.LogInformation("Connecting to RabbitMQ at {Host}:{Port}...", _factory.HostName, _factory.Port);
                    _connection = await _factory.CreateConnectionAsync(cancellationToken);
                }

                _channel = await _connection.CreateChannelAsync(cancellationToken: cancellationToken);
                return _channel;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to connect to RabbitMQ broker at {Host}:{Port}. Broker message delivery will be skipped.", _factory.HostName, _factory.Port);
                return null;
            }
            finally
            {
                _lock.Release();
            }
        }

        public async Task PublishAsync<T>(string exchange, string routingKey, T message, CancellationToken cancellationToken = default) where T : class
        {
            try
            {
                var channel = await GetChannelAsync(cancellationToken);
                if (channel == null)
                {
                    _logger.LogWarning("RabbitMQ channel unavailable. Skipping publish for {Event} on {RoutingKey}", typeof(T).Name, routingKey);
                    return;
                }

                // Declare topic exchange
                await channel.ExchangeDeclareAsync(
                    exchange: exchange,
                    type: ExchangeType.Topic,
                    durable: true,
                    autoDelete: false,
                    cancellationToken: cancellationToken
                );

                var json = JsonSerializer.Serialize(message);
                var body = Encoding.UTF8.GetBytes(json);

                var props = new BasicProperties
                {
                    ContentType = "application/json",
                    DeliveryMode = DeliveryModes.Persistent
                };

                await channel.BasicPublishAsync(
                    exchange: exchange,
                    routingKey: routingKey,
                    mandatory: false,
                    basicProperties: props,
                    body: body,
                    cancellationToken: cancellationToken
                );

                _logger.LogInformation("Successfully published event {Event} to RabbitMQ [{Exchange} -> {RoutingKey}]", typeof(T).Name, exchange, routingKey);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error occurred while publishing event {Event} to RabbitMQ.", typeof(T).Name);
            }
        }

        public async ValueTask DisposeAsync()
        {
            if (_channel != null)
            {
                await _channel.CloseAsync();
                _channel.Dispose();
            }

            if (_connection != null)
            {
                await _connection.CloseAsync();
                _connection.Dispose();
            }

            _lock.Dispose();
        }
    }
}
