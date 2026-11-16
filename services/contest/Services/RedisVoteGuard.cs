using System.Globalization;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;

namespace JamesThew.ContestService.Services;

/// <summary>Uses Redis for fast duplicate-vote reservations and hot vote counters.</summary>
public sealed class RedisVoteGuard(IConfiguration configuration, ILogger<RedisVoteGuard> logger) : IDisposable
{
    private readonly string host = configuration["Redis:Host"] ?? "localhost";
    private readonly int port = configuration.GetValue("Redis:Port", 6379);
    private readonly string? password = configuration["Redis:Password"];
    private readonly SemaphoreSlim connectionLock = new(1, 1);
    private TcpClient? client;
    private NetworkStream? stream;

    public async Task<bool?> TryReserveAsync(string key, int ttlSeconds, CancellationToken cancellationToken)
    {
        try
        {
            var response = await ExecuteAsync(["SET", key, "1", "NX", "EX", ttlSeconds.ToString(CultureInfo.InvariantCulture)], cancellationToken);
            return response == "OK";
        }
        catch (Exception exception) when (IsRedisUnavailable(exception))
        {
            logger.LogDebug(exception, "Redis vote reservation unavailable; SQL duplicate protection remains active.");
            return null;
        }
    }

    public async Task ReleaseAsync(string key, CancellationToken cancellationToken)
    {
        try
        {
            await ExecuteAsync(["DEL", key], cancellationToken);
        }
        catch (Exception exception) when (IsRedisUnavailable(exception))
        {
            logger.LogDebug(exception, "Could not release a Redis vote reservation.");
        }
    }

    public async Task<int?> SynchronizeVoteCountAsync(string key, int sqlVoteCount, CancellationToken cancellationToken)
    {
        const string script = "local current = tonumber(redis.call('GET', KEYS[1])); local actual = tonumber(ARGV[1]); if not current or current < actual then redis.call('SET', KEYS[1], actual, 'EX', 31536000); return actual end; return current";
        try
        {
            var response = await ExecuteAsync(["EVAL", script, "1", key, sqlVoteCount.ToString(CultureInfo.InvariantCulture)], cancellationToken);
            return int.TryParse(response, NumberStyles.Integer, CultureInfo.InvariantCulture, out var value) ? value : null;
        }
        catch (Exception exception) when (IsRedisUnavailable(exception))
        {
            logger.LogDebug(exception, "Redis vote counter unavailable; returning the persisted SQL count.");
            return null;
        }
    }

    public static string Hash(string value) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value))).ToLowerInvariant();

    private async Task<string?> ExecuteAsync(IReadOnlyList<string> arguments, CancellationToken cancellationToken)
    {
        await connectionLock.WaitAsync(cancellationToken);
        try
        {
            await EnsureConnectedAsync(cancellationToken);
            await WriteCommandAsync(stream!, arguments, cancellationToken);
            return await ReadResponseAsync(stream!, cancellationToken);
        }
        catch
        {
            ResetConnection();
            throw;
        }
        finally
        {
            connectionLock.Release();
        }
    }

    private async Task EnsureConnectedAsync(CancellationToken cancellationToken)
    {
        if (stream is not null && client?.Connected == true)
        {
            return;
        }

        ResetConnection();
        var newClient = new TcpClient();
        try
        {
            await newClient.ConnectAsync(host, port, cancellationToken);
            client = newClient;
            stream = newClient.GetStream();
            if (!string.IsNullOrEmpty(password))
            {
                await WriteCommandAsync(stream, ["AUTH", password], cancellationToken);
                await ReadResponseAsync(stream, cancellationToken);
            }
        }
        catch
        {
            newClient.Dispose();
            client = null;
            stream = null;
            throw;
        }
    }

    private void ResetConnection()
    {
        stream?.Dispose();
        client?.Dispose();
        stream = null;
        client = null;
    }

    public void Dispose()
    {
        ResetConnection();
        connectionLock.Dispose();
    }

    private static async Task WriteCommandAsync(NetworkStream stream, IReadOnlyList<string> arguments, CancellationToken cancellationToken)
    {
        var builder = new StringBuilder().Append('*').Append(arguments.Count).Append("\r\n");
        foreach (var argument in arguments)
        {
            var byteCount = Encoding.UTF8.GetByteCount(argument);
            builder.Append('$').Append(byteCount).Append("\r\n").Append(argument).Append("\r\n");
        }

        await stream.WriteAsync(Encoding.UTF8.GetBytes(builder.ToString()), cancellationToken);
    }

    private static async Task<string?> ReadResponseAsync(NetworkStream stream, CancellationToken cancellationToken)
    {
        var prefix = await ReadByteAsync(stream, cancellationToken);
        var line = await ReadLineAsync(stream, cancellationToken);
        return prefix switch
        {
            (byte)'+' => line,
            (byte)':' => line,
            (byte)'-' => throw new InvalidOperationException($"Redis error: {line}"),
            (byte)'$' => await ReadBulkResponseAsync(stream, line, cancellationToken),
            _ => throw new IOException("Redis returned an unsupported response.")
        };
    }

    private static async Task<string?> ReadBulkResponseAsync(NetworkStream stream, string lengthText, CancellationToken cancellationToken)
    {
        if (!int.TryParse(lengthText, NumberStyles.Integer, CultureInfo.InvariantCulture, out var length) || length < -1)
        {
            throw new IOException("Redis returned an invalid bulk response length.");
        }

        if (length == -1)
        {
            return null;
        }

        var buffer = new byte[length + 2];
        await ReadExactlyAsync(stream, buffer, cancellationToken);
        return Encoding.UTF8.GetString(buffer, 0, length);
    }

    private static async Task<string> ReadLineAsync(NetworkStream stream, CancellationToken cancellationToken)
    {
        using var bytes = new MemoryStream();
        while (true)
        {
            var current = await ReadByteAsync(stream, cancellationToken);
            if (current == '\r')
            {
                if (await ReadByteAsync(stream, cancellationToken) != '\n')
                {
                    throw new IOException("Redis returned an invalid line ending.");
                }

                return Encoding.UTF8.GetString(bytes.ToArray());
            }

            bytes.WriteByte(current);
        }
    }

    private static async Task<byte> ReadByteAsync(NetworkStream stream, CancellationToken cancellationToken)
    {
        var buffer = new byte[1];
        await ReadExactlyAsync(stream, buffer, cancellationToken);
        return buffer[0];
    }

    private static async Task ReadExactlyAsync(NetworkStream stream, byte[] buffer, CancellationToken cancellationToken)
    {
        var offset = 0;
        while (offset < buffer.Length)
        {
            var read = await stream.ReadAsync(buffer.AsMemory(offset), cancellationToken);
            if (read == 0)
            {
                throw new IOException("Redis closed the connection before completing a response.");
            }

            offset += read;
        }
    }

    private static bool IsRedisUnavailable(Exception exception) =>
        exception is SocketException or IOException or InvalidOperationException or ObjectDisposedException;
}
