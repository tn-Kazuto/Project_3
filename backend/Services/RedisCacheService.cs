using System.Text.Json;
using backend.Services.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    /// <summary>
    /// Implements distributed caching backed by Redis (StackExchange.Redis) or In-Memory fallback.
    /// Resilient design: Network timeouts or disconnects log warnings without crashing HTTP requests.
    /// </summary>
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _cache;
        private readonly ILogger<RedisCacheService> _logger;

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        public RedisCacheService(IDistributedCache cache, ILogger<RedisCacheService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                var bytes = await _cache.GetAsync(key, cancellationToken);
                if (bytes == null || bytes.Length == 0)
                {
                    return default;
                }

                return JsonSerializer.Deserialize<T>(bytes, JsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis cache GET failed for key '{Key}'. Gracefully falling back to database.", key);
                return default;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var bytes = JsonSerializer.SerializeToUtf8Bytes(value, JsonOptions);
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiry ?? TimeSpan.FromMinutes(10)
                };

                await _cache.SetAsync(key, bytes, options, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis cache SET failed for key '{Key}'. Skipping cache entry.", key);
            }
        }

        public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
        {
            try
            {
                await _cache.RemoveAsync(key, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis cache REMOVE failed for key '{Key}'.", key);
            }
        }
    }
}

