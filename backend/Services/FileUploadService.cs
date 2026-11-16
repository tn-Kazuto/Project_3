using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    /// <summary>
    /// Implements secure file storage for culinary recipes and contest entries.
    /// Defends against file-upload attacks:
    /// 1. Strict extension whitelisting (.jpg, .jpeg, .png, .webp, .gif)
    /// 2. MIME type verification
    /// 3. Header magic-byte signature validation (prevents disguised executable payloads)
    /// 4. Cryptographic GUID filename generation (prevents directory traversal and overwrites)
    /// 5. 10MB maximum payload restriction
    /// </summary>
    public class FileUploadService : IFileUploadService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<FileUploadService> _logger;

        private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
        };

        private static readonly Dictionary<string, string> ExtensionToMime = new(StringComparer.OrdinalIgnoreCase)
        {
            { ".jpg", "image/jpeg" },
            { ".jpeg", "image/jpeg" },
            { ".png", "image/png" },
            { ".webp", "image/webp" },
            { ".gif", "image/gif" }
        };

        public FileUploadService(IWebHostEnvironment env, ILogger<FileUploadService> logger)
        {
            _env = env;
            _logger = logger;
        }

        public async Task<ApiResponse<FileUploadResponseDto>> UploadImageAsync(IFormFile? file, string subfolder = "images")
        {
            if (file == null || file.Length == 0)
            {
                return ApiResponse<FileUploadResponseDto>.Fail("No file was uploaded or file is empty.");
            }

            if (file.Length > MaxFileSizeBytes)
            {
                return ApiResponse<FileUploadResponseDto>.Fail("File size exceeds the maximum allowed limit of 10 MB.");
            }

            // 1. Validate file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                return ApiResponse<FileUploadResponseDto>.Fail(
                    $"Invalid file format '{extension}'. Allowed image extensions are: .jpg, .jpeg, .png, .webp, .gif.");
            }

            // 2. Validate MIME type
            if (!string.IsNullOrEmpty(file.ContentType) &&
                !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                return ApiResponse<FileUploadResponseDto>.Fail("File must be a valid image.");
            }

            // 3. Validate Magic Bytes (Header signature)
            using (var stream = file.OpenReadStream())
            {
                if (!IsValidImageHeader(stream, extension))
                {
                    return ApiResponse<FileUploadResponseDto>.Fail(
                        "File content does not match a valid image signature. The file may be corrupt or disguised.");
                }
            }

            // 4. Generate safe, collision-proof filename
            var sanitizedSubfolder = SanitizeSubfolder(subfolder);
            var safeFileName = $"{Guid.NewGuid():N}{extension}";

            // 5. Determine upload root
            var rootPath = _env.WebRootPath;
            if (string.IsNullOrWhiteSpace(rootPath))
            {
                rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            var targetDirectory = Path.Combine(rootPath, "uploads", sanitizedSubfolder);
            if (!Directory.Exists(targetDirectory))
            {
                Directory.CreateDirectory(targetDirectory);
            }

            var fullPath = Path.Combine(targetDirectory, safeFileName);

            // 6. Save stream to disk
            using (var outputStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(outputStream);
            }

            _logger.LogInformation("Culinary image stored successfully at {FullPath} ({Bytes} bytes)", fullPath, file.Length);

            var determinedMime = ExtensionToMime.TryGetValue(extension, out var mime) ? mime : "image/jpeg";

            return ApiResponse<FileUploadResponseDto>.Ok(new FileUploadResponseDto
            {
                Url = $"/api/upload/{sanitizedSubfolder}/{safeFileName}",
                StaticPath = $"/uploads/{sanitizedSubfolder}/{safeFileName}",
                FileName = safeFileName,
                OriginalFileName = Path.GetFileName(file.FileName),
                FileSize = file.Length,
                ContentType = determinedMime,
                UploadedAt = DateTime.UtcNow
            }, "Image uploaded successfully.");
        }

        public (byte[]? FileBytes, string? ContentType) GetImage(string fileName, string subfolder = "images")
        {
            var cleanFileName = Path.GetFileName(fileName);
            var sanitizedSubfolder = SanitizeSubfolder(subfolder);

            var rootPath = _env.WebRootPath;
            if (string.IsNullOrWhiteSpace(rootPath))
            {
                rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            var fullPath = Path.Combine(rootPath, "uploads", sanitizedSubfolder, cleanFileName);
            if (!File.Exists(fullPath))
            {
                return (null, null);
            }

            var ext = Path.GetExtension(cleanFileName);
            var mime = ExtensionToMime.TryGetValue(ext, out var m) ? m : "application/octet-stream";
            var bytes = File.ReadAllBytes(fullPath);

            return (bytes, mime);
        }

        public bool DeleteImage(string fileName, string subfolder = "images")
        {
            var cleanFileName = Path.GetFileName(fileName);
            var sanitizedSubfolder = SanitizeSubfolder(subfolder);

            var rootPath = _env.WebRootPath;
            if (string.IsNullOrWhiteSpace(rootPath))
            {
                rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            var fullPath = Path.Combine(rootPath, "uploads", sanitizedSubfolder, cleanFileName);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return true;
            }

            return false;
        }

        private static string SanitizeSubfolder(string folder)
        {
            if (string.IsNullOrWhiteSpace(folder)) return "images";
            var cleaned = new string(folder.Where(char.IsLetterOrDigit).ToArray());
            return string.IsNullOrEmpty(cleaned) ? "images" : cleaned.ToLowerInvariant();
        }

        private static bool IsValidImageHeader(Stream stream, string extension)
        {
            stream.Position = 0;
            var header = new byte[12];
            var bytesRead = stream.Read(header, 0, header.Length);
            stream.Position = 0;

            if (bytesRead < 4) return false;

            // JPEG: FF D8 FF
            if (extension is ".jpg" or ".jpeg")
            {
                return header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
            }

            // PNG: 89 50 4E 47
            if (extension == ".png")
            {
                return header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;
            }

            // GIF: 47 49 46 38
            if (extension == ".gif")
            {
                return header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38;
            }

            // WEBP: "RIFF" .... "WEBP"
            if (extension == ".webp")
            {
                if (bytesRead < 12) return false;
                bool isRiff = header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46; // RIFF
                bool isWebp = header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50; // WEBP
                return isRiff && isWebp;
            }

            return false;
        }
    }
}

