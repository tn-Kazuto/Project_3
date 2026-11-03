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
    /// Test suite for Phase U2: Multimedia Content Hub & Social Viral Engagement (SRS v2.0).
    /// Validates ContentType filtering (VIDEO, TALKSHOW, LIVESHOW, ARTICLE) and Facebook / Social Share Count API.
    /// </summary>
    public class UpgradePhaseU2Tests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public UpgradePhaseU2Tests(CustomWebApplicationFactory factory)
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
        public async Task TC_U2_1_FilterRecipesByContentType_ReturnsOnlyMatchingTypes()
        {
            var token = await GetAdminTokenAsync();

            int categoryId;
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var category = await db.Categories.FirstAsync();
                categoryId = category.CategoryId;
            }

            using var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/recipes");
            createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            createReq.Content = JsonContent.Create(new CreateRecipeRequest
            {
                Title = "Chef's Signature Beef Wellington Live",
                CategoryId = categoryId,
                Ingredients = "Beef tenderloin, puff pastry, mushroom duxelles",
                CookingProcedure = "Watch the live stream and prepare puff pastry with chef.",
                IsFree = true,
                ContentType = "LIVESHOW",
                VideoUrl = "https://www.youtube.com/watch?v=live123",
                ThumbnailUrl = "https://images.unsplash.com/photo-1544025162-d76694265947"
            });
            var createRes = await _client.SendAsync(createReq);
            Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);

            // Filter by contentType = LIVESHOW
            var filterRes = await _client.GetAsync("/api/recipes?contentType=LIVESHOW");
            Assert.Equal(HttpStatusCode.OK, filterRes.StatusCode);

            var filterBody = await filterRes.Content.ReadFromJsonAsync<ApiResponse<List<RecipeDto>>>();
            Assert.NotNull(filterBody);
            Assert.True(filterBody.Success);
            Assert.NotEmpty(filterBody.Data!);
            Assert.All(filterBody.Data!, r => Assert.Equal("LIVESHOW", r.ContentType));
        }

        [Fact]
        public async Task TC_U2_2_IncrementShareCount_IncrementsAndReturnsUpdatedCount()
        {
            var token = await GetAdminTokenAsync();

            int categoryId;
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var category = await db.Categories.FirstAsync();
                categoryId = category.CategoryId;
            }

            // Create a recipe
            using var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/recipes");
            createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            createReq.Content = JsonContent.Create(new CreateRecipeRequest
            {
                Title = "Viral Sourdough Masterclass",
                CategoryId = categoryId,
                Ingredients = "Flour, water, salt, active starter",
                CookingProcedure = "Ferment 24 hours, score, bake in Dutch oven.",
                IsFree = true,
                ContentType = "TALKSHOW",
                VideoUrl = "https://www.youtube.com/watch?v=sourdough123"
            });
            var createRes = await _client.SendAsync(createReq);
            Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
            var createdRecipe = (await createRes.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>())!.Data!;
            int recipeId = createdRecipe.RecipeId;

            // Step 1: First share
            var shareRes1 = await _client.PostAsync($"/api/recipes/{recipeId}/share", null);
            Assert.Equal(HttpStatusCode.OK, shareRes1.StatusCode);
            var shareBody1 = await shareRes1.Content.ReadFromJsonAsync<ApiResponse<int>>();
            Assert.NotNull(shareBody1);
            Assert.True(shareBody1.Success);
            Assert.True(shareBody1.Data >= 1);
            int count1 = shareBody1.Data;

            // Step 2: Second share
            var shareRes2 = await _client.PostAsync($"/api/recipes/{recipeId}/share", null);
            Assert.Equal(HttpStatusCode.OK, shareRes2.StatusCode);
            var shareBody2 = await shareRes2.Content.ReadFromJsonAsync<ApiResponse<int>>();
            Assert.NotNull(shareBody2);
            Assert.Equal(count1 + 1, shareBody2.Data);

            // Step 3: Verify GetById returns the updated ShareCount
            var getRes = await _client.GetAsync($"/api/recipes/{recipeId}");
            Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);
            var getBody = await getRes.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>();
            Assert.NotNull(getBody?.Data);
            Assert.Equal(shareBody2.Data, getBody.Data.ShareCount);
        }

        [Fact]
        public async Task TC_U2_3_ShareEndpoint_ReturnsNotFound_ForInvalidId()
        {
            var res = await _client.PostAsync("/api/recipes/999999/share", null);
            Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
        }
    }
}

