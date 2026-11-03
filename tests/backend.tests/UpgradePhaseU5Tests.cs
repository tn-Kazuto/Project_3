using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.DTOs;
using Xunit;

namespace backend.tests
{
    /// <summary>
    /// Test suite for Phase U5: In-App Notification Center & Automated Dual-mode Dispatch.
    /// Validates notification generation on membership subscription, unread counts, and read tracking.
    /// </summary>
    public class UpgradePhaseU5Tests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public UpgradePhaseU5Tests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        private async Task<(string token, int userId)> RegisterTestUserAsync(string prefix, string plan = "MONTHLY")
        {
            var unique = Guid.NewGuid().ToString("N")[..8];
            var regRequest = new RegisterRequest
            {
                Username = $"{prefix}_{unique}",
                Email = $"{prefix}_{unique}@jamesthew.test",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                FullName = $"Chef {prefix} {unique}",
                PlanType = plan,
                CardNumber = "4111222233334444",
                CardHolderName = "TEST HOLDER",
                ExpiryDate = "12/28",
                Cvv = "123"
            };

            var res = await _client.PostAsJsonAsync("/api/auth/register", regRequest);
            Assert.True(res.StatusCode == HttpStatusCode.Created || res.StatusCode == HttpStatusCode.OK);

            var content = await res.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            Assert.NotNull(content);
            Assert.True(content!.Success);

            return (content.Data!.Token, content.Data.User!.UserId);
        }

        [Fact]
        public async Task TC_U5_1_Registration_Triggers_Welcome_Notification()
        {
            // Arrange: Register a new subscriber
            var (token, _) = await RegisterTestUserAsync("u5_notif_sub");

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act: Fetch notifications
            var res = await _client.GetAsync("/api/notifications");

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<NotificationDto>>>();
            Assert.NotNull(body);
            Assert.True(body!.Success);
            Assert.NotEmpty(body.Data!);

            var welcome = body.Data!.FirstOrDefault(n => n.Title.Contains("VIP Pass"));
            Assert.NotNull(welcome);
            Assert.False(welcome!.IsRead);
            Assert.Contains("$10.00", welcome.Message);
        }

        [Fact]
        public async Task TC_U5_2_Notifications_Summary_And_UnreadCount_Endpoints()
        {
            // Arrange
            var (token, _) = await RegisterTestUserAsync("u5_summary");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act: Unread count
            var countRes = await _client.GetAsync("/api/notifications/unread-count");
            Assert.Equal(HttpStatusCode.OK, countRes.StatusCode);

            var countBody = await countRes.Content.ReadFromJsonAsync<ApiResponse<int>>();
            Assert.NotNull(countBody);
            Assert.True(countBody!.Success);
            Assert.True(countBody.Data >= 1);

            // Act: Summary
            var summaryRes = await _client.GetAsync("/api/notifications/summary");
            Assert.Equal(HttpStatusCode.OK, summaryRes.StatusCode);

            var summaryBody = await summaryRes.Content.ReadFromJsonAsync<ApiResponse<NotificationSummaryDto>>();
            Assert.NotNull(summaryBody);
            Assert.True(summaryBody!.Success);
            Assert.Equal(countBody.Data, summaryBody.Data!.UnreadCount);
            Assert.NotEmpty(summaryBody.Data.RecentNotifications);
        }

        [Fact]
        public async Task TC_U5_3_MarkAsRead_And_MarkAllAsRead_Endpoints()
        {
            // Arrange
            var (token, _) = await RegisterTestUserAsync("u5_read");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var listRes = await _client.GetAsync("/api/notifications");
            var listBody = await listRes.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<NotificationDto>>>();
            var notif = listBody!.Data!.First();

            // Act: Mark single notification as read
            var markRes = await _client.PutAsync($"/api/notifications/{notif.NotificationId}/read", null);
            Assert.Equal(HttpStatusCode.OK, markRes.StatusCode);

            var markBody = await markRes.Content.ReadFromJsonAsync<ApiResponse<bool>>();
            Assert.NotNull(markBody);
            Assert.True(markBody!.Data);

            // Verify unread count is decremented
            var countRes = await _client.GetAsync("/api/notifications/unread-count");
            var countBody = await countRes.Content.ReadFromJsonAsync<ApiResponse<int>>();
            Assert.Equal(0, countBody!.Data);

            // Act: Mark all as read (idempotent)
            var readAllRes = await _client.PutAsync("/api/notifications/read-all", null);
            Assert.Equal(HttpStatusCode.OK, readAllRes.StatusCode);
        }
    }
}
