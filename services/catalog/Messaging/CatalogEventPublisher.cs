using System.Text;
using System.Text.Json;
using JamesThew.Shared.Contracts.Events;
using RabbitMQ.Client;

namespace JamesThew.CatalogService.Messaging;

public sealed class CatalogEventPublisher : IAsyncDisposable
{
    private readonly ILogger<CatalogEventPublisher> _logger;
    private readonly ConnectionFactory _factory;
    private readonly bool _enabled;
    private readonly SemaphoreSlim _connectionLock = new(1, 1);
    private IConnection? _connection;
    private IChannel? _channel;

    public CatalogEventPublisher(IConfiguration configuration, ILogger<CatalogEventPublisher> logger)
    {
        _logger = logger;
        _enabled = configuration.GetValue("RabbitMQ:Enabled", true);
        _factory = new ConnectionFactory
        {
            HostName = configuration["RabbitMQ:HostName"] ?? "localhost",
            Port = configuration.GetValue("RabbitMQ:Port", 5672),
            UserName = configuration["RabbitMQ:UserName"] ?? string.Empty,
            Password = configuration["RabbitMQ:Password"] ?? string.Empty
        };
    }

    public async Task PublishRecipePublishedAsync(RecipePublishedEvent message, CancellationToken cancellationToken)
    {
        try
        {
            var channel = await GetChannelAsync(cancellationToken);
            if (channel is null)
            {
                _logger.LogWarning("RabbitMQ is unavailable; recipe publication event was skipped for {RecipeId}.", message.RecipeId);
                return;
            }

            await channel.ExchangeDeclareAsync("jamesthew.events", ExchangeType.Topic, durable: true,
                autoDelete: false, cancellationToken: cancellationToken);
            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
            var properties = new BasicProperties
            {
                ContentType = "application/json",
                DeliveryMode = DeliveryModes.Persistent
            };
            await channel.BasicPublishAsync("jamesthew.events", "recipe.published", mandatory: false,
                basicProperties: properties, body: body, cancellationToken: cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning(exception, "Failed to publish recipe event for {RecipeId}.", message.RecipeId);
        }
    }

    private async Task<IChannel?> GetChannelAsync(CancellationToken cancellationToken)
    {
        if (!_enabled) return null;
        if (_channel is { IsOpen: true }) return _channel;

        await _connectionLock.WaitAsync(cancellationToken);
        try
        {
            if (_channel is { IsOpen: true }) return _channel;
            if (_connection is not { IsOpen: true })
            {
                _connection = await _factory.CreateConnectionAsync(cancellationToken);
            }

            _channel = await _connection.CreateChannelAsync(cancellationToken: cancellationToken);
            return _channel;
        }
        catch (Exception exception) when (exception is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning(exception, "Could not connect to RabbitMQ at {Host}:{Port}.", _factory.HostName, _factory.Port);
            return null;
        }
        finally
        {
            _connectionLock.Release();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_channel is not null)
        {
            await _channel.CloseAsync();
            _channel.Dispose();
        }

        if (_connection is not null)
        {
            await _connection.CloseAsync();
            _connection.Dispose();
        }

        _connectionLock.Dispose();
    }
}
