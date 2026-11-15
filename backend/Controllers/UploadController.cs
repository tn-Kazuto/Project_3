using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// File upload controller for uploading and serving real culinary images (dishes, ingredients, cover art).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IFileUploadService _uploadService;

        public UploadController(IFileUploadService uploadService)
        {
            _uploadService = uploadService;
        }

        /// <summary>
        /// Uploads an image file (JPEG, PNG, WEBP, GIF, max 10MB) from the user's computer.
        /// Returns an accessible URL that can be directly saved into recipe, tip, or contest entries.
        /// </summary>
        /// <param name="file">The image file payload (multipart/form-data).</param>
        /// <param name="folder">Optional category subfolder (e.g. recipes, tips, avatars). Defaults to 'recipes'.</param>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ApiResponse<FileUploadResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<FileUploadResponseDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile? file, [FromForm] string? folder = "recipes")
        {
            var targetFolder = string.IsNullOrWhiteSpace(folder) ? "recipes" : folder;
            var result = await _uploadService.UploadImageAsync(file, targetFolder);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Retrieves and streams an uploaded image by subfolder and filename.
        /// Caches the image for optimal browser rendering performance.
        /// </summary>
        [HttpGet("{subfolder}/{fileName}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetImage(string subfolder, string fileName)
        {
            var (fileBytes, contentType) = _uploadService.GetImage(fileName, subfolder);
            if (fileBytes == null || contentType == null)
            {
                return NotFound(ApiResponse.Fail("Image not found."));
            }

            Response.Headers.CacheControl = "public, max-age=86400";
            return File(fileBytes, contentType);
        }

        /// <summary>
        /// Convenience route to retrieve images from the default 'images' or 'recipes' subfolder.
        /// </summary>
        [HttpGet("images/{fileName}")]
        [AllowAnonymous]
        public IActionResult GetDefaultImage(string fileName)
        {
            var (fileBytes, contentType) = _uploadService.GetImage(fileName, "recipes");
            if (fileBytes == null)
            {
                (fileBytes, contentType) = _uploadService.GetImage(fileName, "images");
            }

            if (fileBytes == null || contentType == null)
            {
                return NotFound(ApiResponse.Fail("Image not found."));
            }

            Response.Headers.CacheControl = "public, max-age=86400";
            return File(fileBytes, contentType);
        }

        /// <summary>
        /// Deletes an uploaded culinary image. Restricted to Admin and Members.
        /// </summary>
        [HttpDelete("{subfolder}/{fileName}")]
        [Authorize(Roles = "ADMIN,MEMBER")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult DeleteImage(string subfolder, string fileName)
        {
            bool deleted = _uploadService.DeleteImage(fileName, subfolder);
            if (!deleted)
            {
                return NotFound(ApiResponse<bool>.Fail("Image not found or already deleted."));
            }

            return Ok(ApiResponse<bool>.Ok(true, "Image deleted successfully."));
        }
    }
}

