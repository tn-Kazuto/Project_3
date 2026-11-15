using System.ComponentModel.DataAnnotations;

namespace JamesThew.MediaService.DTOs;

public sealed class CreateUploadTicketRequest
{
    [Required, StringLength(255, MinimumLength = 1)]
    public string FileName { get; init; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 1)]
    public string ContentType { get; init; } = string.Empty;

    [Range(1, CloudinaryUploadProvider.MaxUploadBytes)]
    public long Size { get; init; }

    [Required, RegularExpression("^(image|video)$", RegexOptions.IgnoreCase)]
    public string Kind { get; init; } = string.Empty;
}

public sealed class CompleteUploadRequest
{
    [Required, StringLength(200, MinimumLength = 1)]
    public string PublicId { get; init; } = string.Empty;

    [Required, StringLength(40, MinimumLength = 40)]
    public string Signature { get; init; } = string.Empty;

    [Required, StringLength(16, MinimumLength = 1)]
    public string ResourceType { get; init; } = string.Empty;

    [Range(1, CloudinaryUploadProvider.MaxUploadBytes)]
    public long Bytes { get; init; }

    [Required, StringLength(16, MinimumLength = 1)]
    public string Format { get; init; } = string.Empty;

    [Range(1, long.MaxValue)]
    public long Version { get; init; }
}

public sealed record UploadTicketResponse(
    Guid TicketId,
    string UploadUrl,
    IReadOnlyDictionary<string, string> Fields,
    DateTime ExpiresAtUtc);

public sealed record CompletedUploadResponse(
    Guid TicketId,
    string SecureUrl,
    string ResourceType,
    string Format,
    long Bytes);
