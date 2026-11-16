using System.Collections.Concurrent;
using System.Globalization;
using System.Net;
using System.Net.Sockets;
using System.Text;

namespace backend.tests;

internal sealed class RedisCatalogCacheTestServer : IAsyncDisposable
{
    private readonly TcpListener _listener = new(IPAddress.Loopback, 0);
    private readonly CancellationTokenSource _shutdown = new();
    private readonly ConcurrentDictionary<string, string> _values = new(StringComparer.Ordinal);
    private readonly ConcurrentQueue<string> _errors = new();
    private readonly Task _acceptLoop;

    public RedisCatalogCacheTestServer()
    {
        _listener.Start();
        Port = ((IPEndPoint)_listener.LocalEndpoint).Port;
        _acceptLoop = AcceptClientsAsync();
    }

    public int Port { get; }
    public IReadOnlyCollection<string> Errors => _errors.ToArray();

    public string? GetStoredValue(string key) =>
        _values.TryGetValue(key, out var value) ? value : null;

    public async ValueTask DisposeAsync()
    {
        await _shutdown.CancelAsync();
        _listener.Stop();
        await _acceptLoop;
        _shutdown.Dispose();
    }

    private async Task AcceptClientsAsync()
    {
        try
        {
            while (!_shutdown.IsCancellationRequested)
            {
                var client = await _listener.AcceptTcpClientAsync(_shutdown.Token);
                _ = HandleClientAsync(client);
            }
        }
        catch (OperationCanceledException) when (_shutdown.IsCancellationRequested)
        {
        }
        catch (SocketException) when (_shutdown.IsCancellationRequested)
        {
        }
    }

    private async Task HandleClientAsync(TcpClient client)
    {
        using (client)
        await using (var stream = client.GetStream())
        {
            try
            {
                while (await ReadCommandAsync(stream, _shutdown.Token) is { } command)
                {
                    var response = Execute(command);
                    await stream.WriteAsync(Encoding.UTF8.GetBytes(response), _shutdown.Token);
                }
            }
            catch (OperationCanceledException) when (_shutdown.IsCancellationRequested)
            {
            }
            catch (IOException exception)
            {
                _errors.Enqueue(exception.Message);
            }
            catch (FormatException exception)
            {
                _errors.Enqueue(exception.Message);
            }
            catch (InvalidOperationException exception)
            {
                _errors.Enqueue(exception.Message);
            }
        }
    }

    private string Execute(IReadOnlyList<string> command)
    {
        return command[0] switch
        {
            "GET" => GetReply(command[1]),
            "SET" => SetValue(command[1], command[2]),
            "INCR" => Increment(command[1]),
            "DEL" => Delete(command[1]),
            _ => throw new InvalidOperationException($"Unsupported test Redis command: {command[0]}.")
        };
    }

    private string GetReply(string key) => _values.TryGetValue(key, out var value)
        ? $"${Encoding.UTF8.GetByteCount(value)}\r\n{value}\r\n"
        : "$-1\r\n";

    private string SetValue(string key, string value)
    {
        _values[key] = value;
        return "+OK\r\n";
    }

    private string Increment(string key)
    {
        var nextValue = _values.AddOrUpdate(
            key,
            "1",
            (_, current) => (int.Parse(current, CultureInfo.InvariantCulture) + 1)
                .ToString(CultureInfo.InvariantCulture));
        return $":{nextValue}\r\n";
    }

    private string Delete(string key) =>
        _values.TryRemove(key, out _) ? ":1\r\n" : ":0\r\n";

    private async Task<IReadOnlyList<string>?> ReadCommandAsync(
        Stream stream,
        CancellationToken cancellationToken)
    {
        var header = await ReadLineAsync(stream, cancellationToken);
        if (header is null) return null;
        if (header[0] != '*') throw new IOException("Invalid RESP command header.");

        var argumentCount = int.Parse(header.AsSpan(1), CultureInfo.InvariantCulture);
        var arguments = new string[argumentCount];
        for (var index = 0; index < argumentCount; index++)
        {
            var lengthHeader = await ReadLineAsync(stream, cancellationToken)
                ?? throw new IOException("Missing RESP bulk string length.");
            var length = int.Parse(lengthHeader.AsSpan(1), CultureInfo.InvariantCulture);
            var bytes = new byte[length];
            await stream.ReadExactlyAsync(bytes, cancellationToken);
            await ReadBulkEndingAsync(stream, cancellationToken);
            arguments[index] = Encoding.UTF8.GetString(bytes);
        }

        return arguments;
    }

    private static async Task<string?> ReadLineAsync(Stream stream, CancellationToken cancellationToken)
    {
        using var line = new MemoryStream();
        var buffer = new byte[1];
        while (await stream.ReadAsync(buffer, cancellationToken) == 1)
        {
            if (buffer[0] == '\r')
            {
                await ReadCrLfAsync(stream, cancellationToken);
                return Encoding.ASCII.GetString(line.ToArray());
            }

            line.WriteByte(buffer[0]);
        }

        return line.Length == 0 ? null : throw new IOException("Incomplete RESP line.");
    }

    private static async Task ReadCrLfAsync(Stream stream, CancellationToken cancellationToken)
    {
        var ending = new byte[1];
        await stream.ReadExactlyAsync(ending, cancellationToken);
        if (ending[0] != '\n') throw new IOException("Invalid RESP line ending.");
    }

    private static async Task ReadBulkEndingAsync(Stream stream, CancellationToken cancellationToken)
    {
        var ending = new byte[2];
        await stream.ReadExactlyAsync(ending, cancellationToken);
        if (ending[0] != '\r' || ending[1] != '\n')
            throw new IOException("Invalid RESP bulk string ending.");
    }
}
