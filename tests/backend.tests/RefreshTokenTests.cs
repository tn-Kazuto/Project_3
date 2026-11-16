using System.Net;
using System.Net.Http.Json;
using backend.DTOs;
using Xunit;

namespace backend.tests
{
    /// <summary>
    /// Integration tests for Refresh Token & HttpOnly Cookie implementation:
    /// - Secure HttpOnly cookie issuance on login/register
    /// - Token rotation upon refreshing
    /// - Revocation upon logout
    /// - Rejection of revoked or expired tokens
    /// </summary>
    public class RefreshTokenTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public RefreshTokenTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task TC_AUTH_RT_01_Login_Sets_HttpOnly_Cookie_And_Returns_Token()
        {
            // Act: Login with seeded Admin account (james@jamesthew.com / TestOnlyAdminSeedPassword!2026)
            var loginRes = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
            {
                EmailOrUsername = "james@jamesthew.com",
                Password = "TestOnlyAdminSeedPassword!2026"
            });

            // Assert
            Assert.Equal(HttpStatusCode.OK, loginRes.StatusCode);
            var body = await loginRes.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.False(string.IsNullOrWhiteSpace(body.Data?.Token));
            Assert.False(string.IsNullOrWhiteSpace(body.Data?.RefreshToken));

            // Verify Set-Cookie header contains HttpOnly and refreshToken
            var cookies = loginRes.Headers.GetValues("Set-Cookie");
            Assert.Contains(cookies, c => c.Contains("refreshToken=") && c.Contains("httponly", StringComparison.OrdinalIgnoreCase));
        }

        [Fact]
        public async Task TC_AUTH_RT_02_RefreshToken_With_Valid_Cookie_Rotates_Token()
        {
            // 1. Login to obtain initial tokens
            var loginRes = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
            {
                EmailOrUsername = "james@jamesthew.com",
                Password = "TestOnlyAdminSeedPassword!2026"
            });
            var loginBody = await loginRes.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            Assert.NotNull(loginBody?.Data?.RefreshToken);
            var initialRefreshToken = loginBody.Data.RefreshToken;

            // 2. Call refresh-token using Cookie header
            var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token");
            refreshRequest.Headers.Add("Cookie", $"refreshToken={initialRefreshToken}");

            var refreshRes = await _client.SendAsync(refreshRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, refreshRes.StatusCode);
            var refreshBody = await refreshRes.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            Assert.NotNull(refreshBody);
            Assert.True(refreshBody.Success);
            Assert.False(string.IsNullOrWhiteSpace(refreshBody.Data?.Token));
            Assert.False(string.IsNullOrWhiteSpace(refreshBody.Data?.RefreshToken));
            Assert.NotEqual(initialRefreshToken, refreshBody.Data?.RefreshToken); // Rotated!

            // 3. Attempting to re-use the old (now revoked) refresh token must fail with 401
            var freshClient = _factory.CreateClient();
            var replayRes = await freshClient.PostAsJsonAsync("/api/auth/refresh-token", new RefreshTokenRequest
            {
                RefreshToken = initialRefreshToken
            });
            Assert.Equal(HttpStatusCode.Unauthorized, replayRes.StatusCode);
        }

        [Fact]
        public async Task TC_AUTH_RT_03_RefreshToken_With_RequestBody_Supported_For_NonBrowser_Clients()
        {
            // 1. Login
            var loginRes = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
            {
                EmailOrUsername = "james@jamesthew.com",
                Password = "TestOnlyAdminSeedPassword!2026"
            });
            var loginBody = await loginRes.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            Assert.NotNull(loginBody?.Data?.RefreshToken);
            var token = loginBody.Data.RefreshToken;

            // 2. Refresh via JSON body without Cookie
            var refreshRes = await _client.PostAsJsonAsync("/api/auth/refresh-token", new RefreshTokenRequest
            {
                RefreshToken = token
            });

            // Assert
            Assert.Equal(HttpStatusCode.OK, refreshRes.StatusCode);
            var body = await refreshRes.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.False(string.IsNullOrWhiteSpace(body.Data?.Token));
        }

        [Fact]
        public async Task TC_AUTH_RT_04_Logout_Revokes_Token_And_Clears_Cookie()
        {
            // 1. Login
            var loginRes = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
            {
                EmailOrUsername = "james@jamesthew.com",
                Password = "TestOnlyAdminSeedPassword!2026"
            });
            var loginBody = await loginRes.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            Assert.NotNull(loginBody?.Data?.RefreshToken);
            var token = loginBody.Data.RefreshToken;

            // 2. Logout
            var logoutRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
            logoutRequest.Headers.Add("Cookie", $"refreshToken={token}");
            var logoutRes = await _client.SendAsync(logoutRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, logoutRes.StatusCode);
            var cookies = logoutRes.Headers.GetValues("Set-Cookie");
            Assert.Contains(cookies, c => c.Contains("refreshToken=") && (c.Contains("expires=") || c.Contains("max-age=0")));

            // 3. Trying to refresh after logout must fail
            var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh-token");
            refreshRequest.Headers.Add("Cookie", $"refreshToken={token}");
            var refreshRes = await _client.SendAsync(refreshRequest);
            Assert.Equal(HttpStatusCode.Unauthorized, refreshRes.StatusCode);
        }
    }
}
