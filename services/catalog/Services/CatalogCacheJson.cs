using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace JamesThew.CatalogService.Services;

public static class CatalogCacheJson
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static async Task<T?> ReadJsonAsync<T>(
        this RedisCatalogCache cache,
        string key,
        CancellationToken cancellationToken)
    {
        var json = await cache.GetAsync(key, cancellationToken);
        if (json is null) return default;

        try
        {
            return JsonSerializer.Deserialize<T>(json, JsonOptions);
        }
        catch (JsonException)
        {
            await cache.DeleteAsync(key, cancellationToken);
            return default;
        }
    }

    public static Task WriteJsonAsync<T>(
        this RedisCatalogCache cache,
        string key,
        T value,
        int ttlSeconds,
        CancellationToken cancellationToken) =>
        cache.SetAsync(key, JsonSerializer.Serialize(value, JsonOptions), ttlSeconds, cancellationToken);

    public static string HashKey(params string?[] values)
    {
        var canonicalValue = string.Join("\n", values.Select(value => value?.Trim().ToLowerInvariant() ?? string.Empty));
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(canonicalValue))).ToLowerInvariant();
    }

    public static async Task<string> VersionedKeyAsync(
        this RedisCatalogCache cache,
        string key,
        CancellationToken cancellationToken)
    {
        var version = await cache.GetAsync("catalog:cache:version", cancellationToken) ?? "0";
        return $"{key}:v{version}";
    }
}
