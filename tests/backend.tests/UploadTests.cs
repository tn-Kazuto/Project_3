using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.DTOs;
using Xunit;

namespace backend.tests
{
    /// <summary>
    /// Integration tests for Image File Upload feature (/api/upload):
    /// - Uploading genuine images (JPEG, PNG)
    /// - Streaming and downloading uploaded images
    /// - Enforcing extension whitelisting
    /// - Blocking spoofed files failing magic-byte signature validation
    /// - Rejecting empty payloads
    /// </summary>
    public class UploadTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public UploadTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task TC_UPLOAD_01_Valid_Jpeg_Upload_Succeeds()
        {
            // Valid minimal JPEG payload: starts with FF D8 FF E0
            var jpegBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01 };
            using var content = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(jpegBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            content.Add(fileContent, "file", "salmon-tartare.jpg");
            content.Add(new StringContent("recipes"), "folder");

            // Act
            var res = await _client.PostAsync("/api/upload", content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<FileUploadResponseDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotNull(body.Data);
            Assert.EndsWith(".jpg", body.Data.FileName);
            Assert.StartsWith("/api/upload/recipes/", body.Data.Url);
            Assert.Equal("image/jpeg", body.Data.ContentType);
        }

        [Fact]
        public async Task TC_UPLOAD_02_GetImage_Streams_Uploaded_File()
        {
            // 1. Upload valid PNG image: starts with 89 50 4E 47
            var pngBytes = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D };
            using var content = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(pngBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            content.Add(fileContent, "file", "truffle-risotto.png");
            content.Add(new StringContent("recipes"), "folder");

            var uploadRes = await _client.PostAsync("/api/upload", content);
            Assert.Equal(HttpStatusCode.OK, uploadRes.StatusCode);
            var uploadBody = await uploadRes.Content.ReadFromJsonAsync<ApiResponse<FileUploadResponseDto>>();
            var imageUrl = uploadBody!.Data!.Url;

            // 2. Fetch the image back
            var getRes = await _client.GetAsync(imageUrl);

            // Assert
            Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);
            Assert.Equal("image/png", getRes.Content.Headers.ContentType?.MediaType);
            var downloadedBytes = await getRes.Content.ReadAsByteArrayAsync();
            Assert.Equal(pngBytes, downloadedBytes);
        }

        [Fact]
        public async Task TC_UPLOAD_03_Invalid_Extension_Rejected()
        {
            var fakeExeBytes = new byte[] { 0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00 };
            using var content = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(fakeExeBytes);
            content.Add(fileContent, "file", "malicious_script.exe");

            // Act
            var res = await _client.PostAsync("/api/upload", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<FileUploadResponseDto>>();
            Assert.NotNull(body);
            Assert.False(body.Success);
            Assert.Contains("Allowed image extensions", body.Message);
        }

        [Fact]
        public async Task TC_UPLOAD_04_Disguised_File_With_Wrong_Magic_Bytes_Rejected()
        {
            // File named .jpg but actually containing raw plain text (no JPEG magic header)
            var textBytes = System.Text.Encoding.UTF8.GetBytes("This is plain text pretending to be an image.");
            using var content = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(textBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            content.Add(fileContent, "file", "disguised_exploit.jpg");

            // Act
            var res = await _client.PostAsync("/api/upload", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<FileUploadResponseDto>>();
            Assert.NotNull(body);
            Assert.False(body.Success);
            Assert.Contains("image signature", body.Message);
        }

        [Fact]
        public async Task TC_UPLOAD_05_Empty_File_Rejected()
        {
            using var content = new MultipartFormDataContent();
            var emptyContent = new ByteArrayContent(Array.Empty<byte>());
            content.Add(emptyContent, "file", "empty.jpg");

            // Act
            var res = await _client.PostAsync("/api/upload", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        }
    }
}

