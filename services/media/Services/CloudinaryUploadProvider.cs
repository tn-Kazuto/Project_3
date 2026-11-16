using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using JamesThew.MediaService.Data;
using JamesThew.MediaService.DTOs;

namespace JamesThew.MediaService.Services;

public sealed class CloudinaryUploadProvider(IConfiguration configuration)
{
    public const long MaxUploadBytes = 100 * 1024 * 1024;
    private static readonly HashSet<string> ImageContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };
    private static readonly HashSet<string> VideoContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "video/mp4", "video/webm", "video/quicktime"
    };
    private static readonly HashSet<string> ImageFormats = new(StringComparer.OrdinalIgnoreCase)
    {
        "jpg", "jpeg", "png", "webp"
    };
    private static readonly HashSet<string> VideoFormats = new(StringComparer.OrdinalIgnoreCase)
    {
        "mp4", "webm", "mov"
    };

    private readonly string _cloudName = configuration["Cloudinary:CloudName"]?.Trim() ?? string.Empty;
    private readonly string _apiKey = configuration["Cloudinary:ApiKey"]?.Trim() ?? string.Empty;
    private readonly string _apiSecret = configuration["Cloudinary:ApiSecret"] ?? string.Empty;
    private readonly string _signatureAlgorithm = configuration["Cloudinary:SignatureAlgorithm"]?.Trim().ToUpperInvariant() ?? "SHA1";

    public bool IsConfigured =>
        IsValidCloudName(_cloudName) &&
        !string.IsNullOrWhiteSpace(_apiKey) &&
        !string.IsNullOrWhiteSpace(_apiSecret) &&
        _signatureAlgorithm is "SHA1" or "SHA256";

    public bool IsSupportedContentType(string kind, string contentType)
    {
        var allowedTypes = kind.Equals("image", StringComparison.OrdinalIgnoreCase)
            ? ImageContentTypes
            : kind.Equals("video", StringComparison.OrdinalIgnoreCase)
                ? VideoContentTypes
                : null;

        return allowedTypes?.Contains(contentType.Trim()) == true;
    }

    public string GetResourceType(string kind) =>
        kind.Equals("video", StringComparison.OrdinalIgnoreCase) ? "video" : "image";

    public UploadTicketResponse CreateTicket(Guid ticketId, int userId, string kind, DateTime expiresAtUtc)
    {
        var resourceType = GetResourceType(kind);
        var allowedFormats = resourceType == "video" ? "mp4,webm,mov" : "jpg,jpeg,png,webp";
        var publicId = $"jamesthew/users/{userId}/{Guid.NewGuid():N}";
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture);
        var fields = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["public_id"] = publicId,
            ["overwrite"] = "false",
            ["allowed_formats"] = allowedFormats,
            ["timestamp"] = timestamp,
            ["api_key"] = _apiKey,
            ["signature"] = CreateSignature(new Dictionary<string, string>
            {
                ["public_id"] = publicId,
                ["overwrite"] = "false",
                ["allowed_formats"] = allowedFormats,
                ["timestamp"] = timestamp
            })
        };

        return new UploadTicketResponse(
            ticketId,
            $"https://api.cloudinary.com/v1_1/{Uri.EscapeDataString(_cloudName)}/{resourceType}/upload",
            fields,
            expiresAtUtc);
    }

    public bool VerifyUpload(
        MediaUploadTicket ticket,
        string publicId,
        string signature,
        string resourceType,
        long bytes,
        string format,
        long version)
    {
        if (!IsConfigured ||
            !string.Equals(publicId, ticket.PublicId, StringComparison.Ordinal) ||
            !string.Equals(resourceType, ticket.ResourceType, StringComparison.Ordinal) ||
            bytes < 1 || bytes > ticket.ExpectedBytes ||
            version < 1 ||
            !IsSupportedFormat(ticket.ResourceType, format) ||
            signature.Length != (_signatureAlgorithm == "SHA256" ? 64 : 40))
        {
            return false;
        }

        byte[] suppliedSignature;
        try
        {
            suppliedSignature = Convert.FromHexString(signature);
        }
        catch (FormatException)
        {
            return false;
        }

        var expectedSignature = Convert.FromHexString(CreateSignature(new Dictionary<string, string>
        {
            ["public_id"] = publicId,
            ["version"] = version.ToString(CultureInfo.InvariantCulture)
        }));

        return CryptographicOperations.FixedTimeEquals(suppliedSignature, expectedSignature);
    }

    public string BuildSecureUrl(MediaUploadTicket ticket, string format, long version)
    {
        var publicIdPath = string.Join(
            "/",
            ticket.PublicId.Split('/').Select(Uri.EscapeDataString));
        return $"https://res.cloudinary.com/{Uri.EscapeDataString(_cloudName)}/{ticket.ResourceType}/upload/v{version}/{publicIdPath}.{Uri.EscapeDataString(format.ToLowerInvariant())}";
    }

    private bool IsSupportedFormat(string resourceType, string format) =>
        resourceType == "image"
            ? ImageFormats.Contains(format)
            : resourceType == "video" && VideoFormats.Contains(format);

    private string CreateSignature(IReadOnlyDictionary<string, string> parameters)
    {
        var canonicalParameters = string.Join(
            "&",
            parameters.OrderBy(parameter => parameter.Key, StringComparer.Ordinal)
                .Select(parameter => $"{parameter.Key}={parameter.Value}"));
        var payload = Encoding.UTF8.GetBytes(canonicalParameters + _apiSecret);
        var digest = _signatureAlgorithm == "SHA256"
            ? SHA256.HashData(payload)
            : SHA1.HashData(payload);
        return Convert.ToHexString(digest).ToLowerInvariant();
    }

    private static bool IsValidCloudName(string cloudName) =>
        cloudName.Length is > 0 and <= 128 &&
        cloudName.All(character => char.IsAsciiLetterOrDigit(character) || character is '-' or '_');
}
