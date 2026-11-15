namespace JamesThew.MediaService.Data;

public sealed class MediaUploadTicket
{
    public Guid TicketId { get; set; }
    public int UserId { get; set; }
    public string ResourceType { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long ExpectedBytes { get; set; }
    public string PublicId { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public long? UploadedBytes { get; set; }
    public string? Format { get; set; }
    public long? Version { get; set; }
    public string? SecureUrl { get; set; }
}
