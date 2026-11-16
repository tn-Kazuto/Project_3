using System.Globalization;
using System.Net.Sockets;
using System.Text;

namespace JamesThew.CatalogService.Services;

/// <summary>Small RESP client for the JSON string operations used by the public catalog cache.</summary>
public sealed class RedisCatalogCache(IConfiguration configuration, ILogger<RedisCatalogCache> logger)
{
    private readonly string host = configuration["Redis:Host"] ?? "localhost";
    private readonly int port = configuration.GetValue("Redis:Port", 6379);
    private readonly string? password = configuration["Redis:Password"];

    public async Task<string?> GetAsync(string key, CancellationToken cancellationToken)
    {
        try
        {
            var response = await ExecuteAsync(["GET", key], cancellationToken);
            return response.Payload is null ? null : Encoding.UTF8.GetString(response.Payload);
        }
        catch (Exception exception) when (IsUnavailable(exception, cancellationToken))
        {
            logger.LogDebug(exception, "Redis catalog cache read failed for {CacheKey}.", key);
            return null;
        }
    }

    public async Task SetAsync(string key, string value, int ttlSeconds, CancellationToken cancellationToken)
    {
        try
        {
            await ExecuteAsync(["SET", key, value, "EX", ttlSeconds.ToString(CultureInfo.InvariantCulture)], cancellationToken);
        }
        catch (Exception exception) when (IsUnavailable(exception, cancellationToken))
        {
            logger.LogDebug(exception, "Redis catalog cache write failed for {CacheKey}.", key);
        }
    }

    public async Task DeleteAsync(string key, CancellationToken cancellationToken)
    {
        try
        {
            await ExecuteAsync(["DEL", key], cancellationToken);
        }
        catch (Exception exception) when (IsUnavailable(exception, cancellationToken))
        {
            logger.LogDebug(exception, "Redis catalog cache cleanup failed for {CacheKey}.", key);
        }
    }

    public async Task InvalidateAsync(CancellationToken cancellationToken)
    {
        try
        {
            await ExecuteAsync(["INCR", "catalog:cache:version"], cancellationToken);
        }
        catch (Exception exception) when (IsUnavailable(exception, cancellationToken))
        {
            logger.LogWarning(exception, "Redis catalog cache invalidation failed; entries will expire by TTL.");
        }
    }

    private async Task<RedisReply> ExecuteAsync(IReadOnlyList<string> arguments, CancellationToken cancellationToken)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(1));
        using var client = new TcpClient { NoDelay = true };
        await client.ConnectAsync(host, port, timeout.Token);
        await using var stream = client.GetStream();

        if (!string.IsNullOrEmpty(password))
        {
            await WriteCommandAsync(stream, ["AUTH", password], timeout.Token);
            var authReply = await ReadReplyAsync(stream, timeout.Token);
            if (authReply.Type != '+') throw new InvalidOperationException("Redis authentication failed.");
        }

        await WriteCommandAsync(stream, arguments, timeout.Token);
        return await ReadReplyAsync(stream, timeout.Token);
    }

    private static async Task WriteCommandAsync(
        NetworkStream stream,
        IReadOnlyList<string> arguments,
        CancellationToken cancellationToken)
    {
        using var buffer = new MemoryStream();
        WriteAscii(buffer, $"*{arguments.Count}\r\n");
        foreach (var argument in arguments)
        {
            var value = Encoding.UTF8.GetBytes(argument);
            WriteAscii(buffer, $"${value.Length}\r\n");
            buffer.Write(value);
            WriteAscii(buffer, "\r\n");
        }

        await stream.WriteAsync(buffer.ToArray(), cancellationToken);
    }

    private static async Task<RedisReply> ReadReplyAsync(NetworkStream stream, CancellationToken cancellationToken)
    {
        var prefix = await ReadByteAsync(stream, cancellationToken);
        var line = await ReadLineAsync(stream, cancellationToken);
        if (prefix == '-') throw new InvalidOperationException($"Redis command failed: {line}");
        if (prefix == '$')
        {
            var length = int.Parse(line, CultureInfo.InvariantCulture);
            if (length < 0) return new RedisReply(prefix, null, null);
            var payload = new byte[length];
            await stream.ReadExactlyAsync(payload, cancellationToken);
            await ExpectCrLfAsync(stream, cancellationToken);
            return new RedisReply(prefix, payload, null);
        }

        if (prefix == ':')
        {
            return new RedisReply(prefix, null, long.Parse(line, CultureInfo.InvariantCulture));
        }

        return new RedisReply(prefix, Encoding.UTF8.GetBytes(line), null);
    }

    private static async Task<string> ReadLineAsync(NetworkStream stream, CancellationToken cancellationToken)
    {
        using var line = new MemoryStream();
        while (true)
        {
            var value = await ReadByteAsync(stream, cancellationToken);
            if (value == '\r')
            {
                if (await ReadByteAsync(stream, cancellationToken) != '\n')
                    throw new IOException("Redis returned an invalid line ending.");
                return Encoding.UTF8.GetString(line.ToArray());
            }

            line.WriteByte(value);
        }
    }

    private static async Task ExpectCrLfAsync(NetworkStream stream, CancellationToken cancellationToken)
    {
        if (await ReadByteAsync(stream, cancellationToken) != '\r' ||
            await ReadByteAsync(stream, cancellationToken) != '\n')
        {
            throw new IOException("Redis returned an invalid bulk string ending.");
        }
    }

    private static async Task<byte> ReadByteAsync(NetworkStream stream, CancellationToken cancellationToken)
    {
        var value = new byte[1];
        if (await stream.ReadAsync(value.AsMemory(), cancellationToken) != 1)
            throw new IOException("Redis closed the connection before completing a response.");
        return value[0];
    }

    private static void WriteAscii(Stream stream, string value) =>
        stream.Write(Encoding.ASCII.GetBytes(value));

    private static bool IsUnavailable(Exception exception, CancellationToken cancellationToken) =>
        exception is IOException or SocketException or InvalidOperationException ||
        (exception is OperationCanceledException && !cancellationToken.IsCancellationRequested);

    private sealed record RedisReply(byte Type, byte[]? Payload, long? Integer);
}
