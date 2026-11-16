namespace backend.DTOs
{
    /// <summary>
    /// Response returned upon successful file or media upload.
    /// Contains relative and accessible URLs for the uploaded asset.
    /// </summary>
    public class FileUploadResponseDto
    {
        /// <summary>
        /// Accessible URL endpoint to retrieve the uploaded image (e.g. /api/upload/images/xyz.jpg).
        /// </summary>
        public string Url { get; set; } = string.Empty;

        /// <summary>
        /// Direct static file path (e.g. /uploads/images/xyz.jpg).
        /// </summary>
        public string StaticPath { get; set; } = string.Empty;

        /// <summary>
        /// Sanitized, cryptographically unique filename on disk.
        /// </summary>
        public string FileName { get; set; } = string.Empty;

        /// <summary>
        /// Original client filename.
        /// </summary>
        public string OriginalFileName { get; set; } = string.Empty;

        /// <summary>
        /// File size in bytes.
        /// </summary>
        public long FileSize { get; set; }

        /// <summary>
        /// Validated MIME content type (e.g. image/jpeg, image/png).
        /// </summary>
        public string ContentType { get; set; } = string.Empty;

        /// <summary>
        /// Timestamp when the file was processed and saved.
        /// </summary>
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}

