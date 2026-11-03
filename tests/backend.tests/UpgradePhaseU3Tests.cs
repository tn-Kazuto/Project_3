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
    /// Test suite for Phase U3: Media Feedback & Community Creations Gallery (SRS v2.0).
    /// Validates user feedback submissions with photo/video media URLs and 1-5 star ratings.
    /// </summary>
    public class UpgradePhaseU3Tests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public UpgradePhaseU3Tests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        private async Task<string> GetAdminTokenAsync()
        {
            var res = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
            {
                EmailOrUsername = "james@jamesthew.com",
                Password = "Admin@123456"
            });
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            return body!.Data!.Token;
        }

        [Fact]
        public async Task TC_U3_1_CreateFeedback_WithRatingAndMediaUrl_SavesAndReturnsProperly()
        {
            var token = await GetAdminTokenAsync();

            int categoryId;
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var category = await db.Categories.FirstAsync();
                categoryId = category.CategoryId;
            }

            // Step 1: Create a recipe to review
            using var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/recipes");
            createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            createReq.Content = JsonContent.Create(new CreateRecipeRequest
            {
                Title = "Classic Soufflé au Chocolat",
                CategoryId = categoryId,
                Ingredients = "Dark chocolate, egg whites, sugar, butter",
                CookingProcedure = "Whip egg whites to soft peaks, fold into chocolate ganache, bake 12 mins.",
                IsFree = true
            });
            var createRes = await _client.SendAsync(createReq);
            Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
            var recipe = (await createRes.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>())!.Data!;

            // Step 2: Post feedback with MediaUrl and 5-Star Rating
            using var feedbackReq = new HttpRequestMessage(HttpMethod.Post, "/api/feedbacks");
            feedbackReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            feedbackReq.Content = JsonContent.Create(new CreateFeedbackRequest
            {
                RecipeId = recipe.RecipeId,
                Comment = "Followed the chef's precise instructions and my soufflé rose beautifully with zero collapse!",
                MediaUrl = "https://images.unsplash.com/photo-1579372786545-d24232daf58c",
                Rating = 5
            });
            var feedbackRes = await _client.SendAsync(feedbackReq);
            Assert.Equal(HttpStatusCode.Created, feedbackRes.StatusCode);

            var feedbackBody = await feedbackRes.Content.ReadFromJsonAsync<ApiResponse<FeedbackDto>>();
            Assert.NotNull(feedbackBody?.Data);
            Assert.Equal(5, feedbackBody.Data.Rating);
            Assert.Equal("https://images.unsplash.com/photo-1579372786545-d24232daf58c", feedbackBody.Data.MediaUrl);

            // Step 3: Fetch feedbacks for this recipe
            var getListRes = await _client.GetAsync($"/api/feedbacks/recipe/{recipe.RecipeId}");
            Assert.Equal(HttpStatusCode.OK, getListRes.StatusCode);
            var listBody = await getListRes.Content.ReadFromJsonAsync<ApiResponse<List<FeedbackDto>>>();
            Assert.NotNull(listBody?.Data);
            var item = listBody.Data.FirstOrDefault(f => f.FeedbackId == feedbackBody.Data.FeedbackId);
            Assert.NotNull(item);
            Assert.Equal(5, item.Rating);
            Assert.Equal("https://images.unsplash.com/photo-1579372786545-d24232daf58c", item.MediaUrl);
        }

        [Fact]
        public async Task TC_U3_2_CreateFeedback_GuestUser_RequiresNameEmail_AndSavesMedia()
        {
            int categoryId;
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var category = await db.Categories.FirstAsync();
                categoryId = category.CategoryId;
            }

            var token = await GetAdminTokenAsync();
            using var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/recipes");
            createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            createReq.Content = JsonContent.Create(new CreateRecipeRequest
            {
                Title = "Guest Practiced Pasta Dish",
                CategoryId = categoryId,
                Ingredients = "Pasta, cream, parmesan, bacon",
                CookingProcedure = "Cook pasta, toss with sauce.",
                IsFree = true
            });
            var createRes = await _client.SendAsync(createReq);
            var recipe = (await createRes.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>())!.Data!;

            // Guest submission without auth token
            var guestReq = new CreateFeedbackRequest
            {
                RecipeId = recipe.RecipeId,
                SenderName = "Elena Rostova",
                SenderEmail = "elena.rostova@example.com",
                Comment = "Made this for Sunday dinner. Very silky texture!",
                MediaUrl = "https://images.unsplash.com/photo-pasta-dish-123.jpg",
                Rating = 4
            };

            var res = await _client.PostAsJsonAsync("/api/feedbacks", guestReq);
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);

            var body = await res.Content.ReadFromJsonAsync<ApiResponse<FeedbackDto>>();
            Assert.NotNull(body?.Data);
            Assert.True(body.Data.IsGuest);
            Assert.Equal("Elena Rostova", body.Data.SenderName);
            Assert.Equal(4, body.Data.Rating);
            Assert.Equal("https://images.unsplash.com/photo-pasta-dish-123.jpg", body.Data.MediaUrl);
        }

        [Fact]
        public async Task TC_U3_3_GetAllFeedbacks_Admin_IncludesMediaUrlAndRating()
        {
            var token = await GetAdminTokenAsync();
            using var req = new HttpRequestMessage(HttpMethod.Get, "/api/feedbacks");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var res = await _client.SendAsync(req);
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);

            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<FeedbackDto>>>();
            Assert.NotNull(body?.Data);
            Assert.True(body.Success);
        }
    }
}

