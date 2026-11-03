using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace backend.tests
{
    /// <summary>
    /// Test suite for Phase 4: Feedback & FAQ APIs.
    /// Strictly verifies Test Cases TC4.1 through TC4.6 as defined in master-plan.md.
    /// </summary>
    public class Phase4Tests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public Phase4Tests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        private async Task<(string Token, int UserId)> GetAdminTokenAsync()
        {
            var res = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
            {
                EmailOrUsername = "james@jamesthew.com",
                Password = "Admin@123456"
            });
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            return (body!.Data!.Token, body.Data.User.UserId);
        }

        private async Task<(string Token, int UserId)> CreateMemberAsync(string username)
        {
            var req = new RegisterRequest
            {
                Username = username,
                FullName = "Member " + username,
                Email = $"{username}@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                PlanType = "MONTHLY",
                CardHolderName = username,
                CardNumber = "4000123456789010",
                ExpiryDate = "12/28",
                Cvv = "123"
            };
            var res = await _client.PostAsJsonAsync("/api/auth/register", req);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            return (body!.Data!.Token, body.Data.User.UserId);
        }

        private async Task<int> CreateSampleRecipeAsync(string token, string title)
        {
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var cat = await db.Categories.FirstAsync();

            var req = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = cat.CategoryId,
                    Title = title,
                    Ingredients = "Sample Ingredients",
                    CookingProcedure = "Sample Procedure",
                    IsFree = true
                })
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var res = await _client.SendAsync(req);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>();
            return body!.Data!.RecipeId;
        }

        [Fact]
        public async Task TC4_1_Guest_Submits_Feedback_For_Recipe_Succeeds()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();
            var recipeId = await CreateSampleRecipeAsync(adminToken, "Delicious Carbonara");

            // Act - Guest submits feedback with name and email
            var req = new CreateFeedbackRequest
            {
                RecipeId = recipeId,
                SenderName = "Food Lover Guest",
                SenderEmail = "foodlover@example.com",
                Comment = "I cooked this dish last night, and my family loved the creamy texture!"
            };
            var res = await _client.PostAsJsonAsync("/api/feedbacks", req);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<FeedbackDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.Equal(recipeId, body.Data!.RecipeId);
            Assert.Null(body.Data.UserId);
            Assert.True(body.Data.IsGuest);
            Assert.Equal("Food Lover Guest", body.Data.SenderName);
        }

        [Fact]
        public async Task TC4_2_Member_Submits_Feedback_Auto_Associates_User()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();
            var recipeId = await CreateSampleRecipeAsync(adminToken, "Tiramisu Delight");

            var (memberToken, memberId) = await CreateMemberAsync("feedback_reviewer_member");

            // Act - Member submits feedback without manual sender fields
            var req = new HttpRequestMessage(HttpMethod.Post, "/api/feedbacks")
            {
                Content = JsonContent.Create(new CreateFeedbackRequest
                {
                    RecipeId = recipeId,
                    Comment = "As a subscriber, I appreciate the chef's authentic espresso ratio tips!"
                })
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<FeedbackDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.Equal(memberId, body.Data!.UserId);
            Assert.False(body.Data.IsGuest);
        }

        [Fact]
        public async Task TC4_3_Submit_General_Website_Feedback_Succeeds()
        {
            // Act - Submit feedback without RecipeId (general website suggestion)
            var req = new CreateFeedbackRequest
            {
                RecipeId = null,
                SenderName = "Website Visitor",
                SenderEmail = "visitor@example.com",
                Comment = "Great layout! Would love to see more video demonstrations in the future."
            };
            var res = await _client.PostAsJsonAsync("/api/feedbacks", req);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<FeedbackDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.Null(body.Data!.RecipeId);
            Assert.Equal("Website Visitor", body.Data.SenderName);
        }

        [Fact]
        public async Task TC4_4_Admin_Views_All_Feedbacks_Across_Platform()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();

            // Submit a feedback first
            await _client.PostAsJsonAsync("/api/feedbacks", new CreateFeedbackRequest
            {
                RecipeId = null,
                SenderName = "Auditor Guest",
                SenderEmail = "auditor@example.com",
                Comment = "Checking site performance."
            });

            // Act - Admin requests all feedback
            var req = new HttpRequestMessage(HttpMethod.Get, "/api/feedbacks");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<FeedbackDto>>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotEmpty(body.Data!);
            Assert.Contains(body.Data!, f => f.SenderName == "Auditor Guest");
        }

        [Fact]
        public async Task TC4_5_Guest_Views_Feedbacks_For_Specific_Recipe()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();
            var recipeId = await CreateSampleRecipeAsync(adminToken, "Pizza Margherita");

            // Post 1 comment on this recipe
            await _client.PostAsJsonAsync("/api/feedbacks", new CreateFeedbackRequest
            {
                RecipeId = recipeId,
                SenderName = "Pizza Fanatic",
                SenderEmail = "fan@pizza.com",
                Comment = "The crust came out super airy!"
            });

            // Act - Guest requests feedbacks for this specific recipe
            var res = await _client.GetAsync($"/api/feedbacks/recipe/{recipeId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<FeedbackDto>>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotEmpty(body.Data!);
            Assert.All(body.Data!, f => Assert.Equal(recipeId, f.RecipeId));
            Assert.Contains(body.Data!, f => f.SenderName == "Pizza Fanatic");
        }

        [Fact]
        public async Task TC4_6_Get_All_Faqs_Returns_7_SRS_Mandated_Questions()
        {
            // Act - Public request to GET /api/faqs
            var res = await _client.GetAsync("/api/faqs");

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<FaqDto>>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.Equal(7, body.Data!.Count);

            // Verify order and key question content matches SRS exactly
            Assert.Equal(1, body.Data[0].DisplayOrder);
            Assert.Equal("How to become the member of this site?", body.Data[0].Question);
            Assert.Contains("$10", body.Data[0].Answer);
            Assert.Contains("$100", body.Data[0].Answer);

            Assert.Equal(2, body.Data[1].DisplayOrder);
            Assert.Equal("Will there be any subscription charges?", body.Data[1].Question);

            Assert.Equal(3, body.Data[2].DisplayOrder);
            Assert.Equal("How to view the recipes and tips? Will there be any charges for that?", body.Data[2].Question);

            Assert.Equal(4, body.Data[3].DisplayOrder);
            Assert.Equal("I am not the registered member of the site. Can I participate in the contest held?", body.Data[3].Question);

            Assert.Equal(5, body.Data[4].DisplayOrder);
            Assert.Equal("How to upload or post the recipes and tips?", body.Data[4].Question);

            Assert.Equal(6, body.Data[5].DisplayOrder);
            Assert.Equal("How to post a feedback?", body.Data[5].Question);

            Assert.Equal(7, body.Data[6].DisplayOrder);
            Assert.Equal("I have posted a recipe or a tip with respect to the contest. How can I know who is the winner?", body.Data[6].Question);
        }

        [Fact]
        public async Task TC_F4_1_Admin_Deletes_Feedback_Succeeds()
        {
            var (adminToken, _) = await GetAdminTokenAsync();

            // Submit feedback
            var submitRes = await _client.PostAsJsonAsync("/api/feedbacks", new CreateFeedbackRequest
            {
                SenderName = "Spam Bot",
                SenderEmail = "spam@bot.net",
                Comment = "Disregard this spam message."
            });
            Assert.Equal(HttpStatusCode.Created, submitRes.StatusCode);
            var submitBody = await submitRes.Content.ReadFromJsonAsync<ApiResponse<FeedbackDto>>();
            var feedbackId = submitBody!.Data!.FeedbackId;

            // Member attempt to delete fails with Forbidden
            var (memberToken, _) = await CreateMemberAsync("mod_member");
            var memberDelMsg = new HttpRequestMessage(HttpMethod.Delete, $"/api/feedbacks/{feedbackId}");
            memberDelMsg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var memberDelRes = await _client.SendAsync(memberDelMsg);
            Assert.Equal(HttpStatusCode.Forbidden, memberDelRes.StatusCode);

            // Admin deletes feedback successfully
            var adminDelMsg = new HttpRequestMessage(HttpMethod.Delete, $"/api/feedbacks/{feedbackId}");
            adminDelMsg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var adminDelRes = await _client.SendAsync(adminDelMsg);
            Assert.Equal(HttpStatusCode.OK, adminDelRes.StatusCode);
        }
    }
}

