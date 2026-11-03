namespace backend.Services.EventBus
{
    /// <summary>
    /// Event Bus contract for publishing domain events asynchronously to RabbitMQ
    /// </summary>
    public interface IEventBus
    {
        /// <summary>
        /// Publishes an event payload to a specified exchange and routing key.
        /// </summary>
        /// <typeparam name="T">Event object type</typeparam>
        /// <param name="exchange">Target exchange name</param>
        /// <param name="routingKey">Routing key or topic</param>
        /// <param name="message">Event payload object</param>
        /// <param name="cancellationToken">Cancellation token</param>
        Task PublishAsync<T>(string exchange, string routingKey, T message, CancellationToken cancellationToken = default) where T : class;
    }
}

