using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using backend.DTOs;
using backend.Hubs;
using backend.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace backend.tests
{
    /// <summary>
    /// Integration tests for SignalR Realtime Hub (/hub/notifications):
    /// - SignalR negotiate endpoint handshake
    /// - Dependency injection verification of IHubContext<NotificationHub>
    /// - Dispatching real-time notifications to connected clients
    /// </summary>
    public class SignalRTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public SignalRTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task TC_SIGNALR_01_Negotiate_Endpoint_Handshake_Succeeds()
        {
            // SignalR client initiates handshake via POST /hub/notifications/negotiate?negotiateVersion=1
            var res = await _client.PostAsync("/hub/notifications/negotiate?negotiateVersion=1", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var content = await res.Content.ReadAsStringAsync();
            Assert.NotNull(content);

            using var doc = JsonDocument.Parse(content);
            Assert.True(doc.RootElement.TryGetProperty("connectionId", out var connId) ||
                        doc.RootElement.TryGetProperty("connectionToken", out _));
        }

        [Fact]
        public async Task TC_SIGNALR_02_HubContext_Injects_And_Dispatches_Without_Errors()
        {
            using var scope = _factory.Services.CreateScope();
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<NotificationHub>>();
            Assert.NotNull(hubContext);

            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
            Assert.NotNull(notificationService);

            // Act: Dispatching notification triggers SignalR broadcast internally
            var createRes = await notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                UserId = 1,
                Title = "Live Masterclass Alert",
                Message = "Chef James Thew is broadcasting a live pasta masterclass now.",
                TargetUrl = "/recipes"
            });

            Assert.True(createRes.Success);
            Assert.NotNull(createRes.Data);
            Assert.Equal("Live Masterclass Alert", createRes.Data.Title);
        }
    }
}

