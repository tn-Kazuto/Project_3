namespace backend.Services.Interfaces
{
    /// <summary>
    /// Distributed caching contract for Redis and high-throughput low-latency data access.
    /// Supports automatic serialization, TTL expiration, and graceful degradation upon connection failure.
    /// </summary>
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default);
        Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    }
}

