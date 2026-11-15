using backend.DTOs;
using Microsoft.AspNetCore.Http;

namespace backend.Services.Interfaces
{
    /// <summary>
    /// Service contract for validating, sanitizing, and persisting media uploads (food photos, recipe steps).
    /// Enforces OWASP image security: MIME checks, extension whitelisting, magic byte signatures, and safe naming.
    /// </summary>
    public interface IFileUploadService
    {
        Task<ApiResponse<FileUploadResponseDto>> UploadImageAsync(IFormFile? file, string subfolder = "images");
        (byte[]? FileBytes, string? ContentType) GetImage(string fileName, string subfolder = "images");
        bool DeleteImage(string fileName, string subfolder = "images");
    }
}

