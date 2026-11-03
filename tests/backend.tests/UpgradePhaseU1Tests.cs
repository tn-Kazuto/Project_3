using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace backend.tests
{
    /// <summary>
    /// Test suite for Phase U1: Database Schema Evolution & Multimedia Entity Upgrades (SRS v2.0).
    /// Verifies multimedia Recipe attributes (VideoUrl, ContentType, ThumbnailUrl, ShareCount),
    /// Tip VideoUrl, Feedback MediaUrl & Rating, and ContestVote & Notification entity persistence.
    /// </summary>
    public class UpgradePhaseU1Tests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public UpgradePhaseU1Tests(CustomWebApplicationFactory factory)
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

        [Fact]
        public async Task TC_U1_1_Recipe_Supports_Multimedia_ContentType_And_VideoUrl()
        {
            var token = await GetAdminTokenAsync();

            int categoryId;
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var category = await db.Categories.FirstAsync();
                categoryId = category.CategoryId;
            }

            var request = new CreateRecipeRequest
            {
                CategoryId = categoryId,
                Title = "Sous-Vide Wagyu Ribeye & Truffle Glaze",
                Ingredients = "Wagyu A5 ribeye, truffle butter, thyme, fleur de sel",
                CookingProcedure = "Vacuum seal wagyu, cook at 54°C for 2 hours, sear on high heat in cast iron with foaming truffle butter.",
                ImageUrl = "https://example.com/wagyu.jpg",
                IsFree = true,
                ContentType = "VIDEO",
                VideoUrl = "https://youtube.com/watch?v=sampleWagyu",
                ThumbnailUrl = "https://example.com/wagyu-thumb.jpg"
            };

            var postReq = new HttpRequestMessage(HttpMethod.Post, "/api/recipes");
            postReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            postReq.Content = JsonContent.Create(request);

            var postRes = await _client.SendAsync(postReq);
            Assert.Equal(HttpStatusCode.Created, postRes.StatusCode);

            var created = await postRes.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>();
            Assert.NotNull(created?.Data);
            Assert.Equal("Sous-Vide Wagyu Ribeye & Truffle Glaze", created.Data.Title);
            Assert.Equal("VIDEO", created.Data.ContentType);
            Assert.Equal("https://youtube.com/watch?v=sampleWagyu", created.Data.VideoUrl);
            Assert.Equal("https://example.com/wagyu-thumb.jpg", created.Data.ThumbnailUrl);
            Assert.Equal(0, created.Data.ShareCount);
        }

        [Fact]
        public async Task TC_U1_2_Tip_Supports_VideoUrl()
        {
            var token = await GetAdminTokenAsync();

            var request = new CreateTipRequest
            {
                Title = "Knife Sharpening Whetstone Mastery",
                Content = "Maintain a consistent 15-degree angle across a 1000/6000 grit Japanese whetstone.",
                IsFree = true,
                VideoUrl = "https://youtube.com/watch?v=sharpeningTips"
            };

            var postReq = new HttpRequestMessage(HttpMethod.Post, "/api/tips");
            postReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            postReq.Content = JsonContent.Create(request);

            var postRes = await _client.SendAsync(postReq);
            Assert.Equal(HttpStatusCode.Created, postRes.StatusCode);

            var created = await postRes.Content.ReadFromJsonAsync<ApiResponse<TipDto>>();
            Assert.NotNull(created?.Data);
            Assert.Equal("Knife Sharpening Whetstone Mastery", created.Data.Title);
            Assert.Equal("https://youtube.com/watch?v=sharpeningTips", created.Data.VideoUrl);
        }

        [Fact]
        public async Task TC_U1_3_Feedback_Supports_MediaUrl_And_Star_Rating()
        {
            var (token, _) = await CreateMemberAsync("gourmet_reviewer_" + Guid.NewGuid().ToString("N")[..6]);

            int recipeId;
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var recipe = await db.Recipes.FirstAsync();
                recipeId = recipe.RecipeId;
            }

            var request = new CreateFeedbackRequest
            {
                RecipeId = recipeId,
                Comment = "I cooked this dish for our anniversary dinner! Outstanding depth of flavor.",
                MediaUrl = "https://example.com/my-cooked-dish.jpg",
                Rating = 5
            };

            var postReq = new HttpRequestMessage(HttpMethod.Post, "/api/feedbacks");
            postReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            postReq.Content = JsonContent.Create(request);

            var postRes = await _client.SendAsync(postReq);
            Assert.Equal(HttpStatusCode.Created, postRes.StatusCode);

            var created = await postRes.Content.ReadFromJsonAsync<ApiResponse<FeedbackDto>>();
            Assert.NotNull(created?.Data);
            Assert.Equal(recipeId, created.Data.RecipeId);
            Assert.Equal("https://example.com/my-cooked-dish.jpg", created.Data.MediaUrl);
            Assert.Equal(5, created.Data.Rating);
        }

        [Fact]
        public async Task TC_U1_4_ContestVote_And_Notification_Entities_Persist_With_Navigation()
        {
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var admin = await db.Users.FirstAsync(u => u.Role == "ADMIN");

            // 1. Create and test Notification entity persistence
            var notification = new Notification
            {
                UserId = admin.UserId,
                Title = "Live Masterclass Reminder",
                Message = "Your live session begins in 30 minutes.",
                TargetUrl = "/liveshow/1",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await db.Notifications.AddAsync(notification);
            await db.SaveChangesAsync();

            var loadedNotification = await db.Notifications
                .Include(n => n.User)
                .FirstOrDefaultAsync(n => n.NotificationId == notification.NotificationId);

            Assert.NotNull(loadedNotification);
            Assert.Equal("Live Masterclass Reminder", loadedNotification.Title);
            Assert.Equal(admin.UserId, loadedNotification.UserId);
            Assert.Equal(admin.Username, loadedNotification.User.Username);

            // 2. Create and test ContestVote entity persistence with ContestEntry
            var contest = await db.Contests.FirstOrDefaultAsync();
            if (contest == null)
            {
                contest = new Contest
                {
                    Title = "Autumn Risotto Trophy",
                    Description = "Culinary competition for best risotto",
                    ContestType = "RECIPE",
                    StartDate = DateTime.UtcNow.AddDays(-1),
                    EndDate = DateTime.UtcNow.AddDays(7),
                    IsActive = true,
                    CreatedBy = admin.UserId
                };
                await db.Contests.AddAsync(contest);
                await db.SaveChangesAsync();
            }

            var entry = new ContestEntry
            {
                ContestId = contest.ContestId,
                Title = "Saffron Gold Risotto Milanese",
                Ingredients = "Carnaroli rice, Persian saffron, bone marrow, parmesan",
                CookingProcedure = "Melt bone marrow, toast carnaroli rice, infuse saffron broth",
                GuestName = "Pierre Gastronome",
                GuestEmail = "pierre@gastronome.com",
                VoteCount = 1
            };
            await db.ContestEntries.AddAsync(entry);
            await db.SaveChangesAsync();

            var vote = new ContestVote
            {
                ContestEntryId = entry.EntryId,
                UserId = admin.UserId,
                VoterIpOrEmail = admin.Email,
                VotedAt = DateTime.UtcNow
            };
            await db.ContestVotes.AddAsync(vote);
            await db.SaveChangesAsync();

            var loadedEntryWithVotes = await db.ContestEntries
                .Include(e => e.Votes)
                .FirstOrDefaultAsync(e => e.EntryId == entry.EntryId);

            Assert.NotNull(loadedEntryWithVotes);
            Assert.Single(loadedEntryWithVotes.Votes);
            Assert.Equal(admin.Email, loadedEntryWithVotes.Votes.First().VoterIpOrEmail);
        }
    }
}
