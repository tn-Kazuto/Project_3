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
    /// Test suite for Phase 2: Recipes, Tips & Categories Management.
    /// Strictly verifies Test Cases TC2.1 through TC2.12 as defined in master-plan.md.
    /// </summary>
    public class Phase2Tests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public Phase2Tests(CustomWebApplicationFactory factory)
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

        private async Task<int> GetFirstCategoryIdAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var cat = await db.Categories.FirstAsync();
            return cat.CategoryId;
        }

        [Fact]
        public async Task TC2_1_Guest_Views_Only_Free_Recipes()
        {
            // Arrange - Create 1 free recipe and 1 member-only recipe as admin
            var (adminToken, _) = await GetAdminTokenAsync();
            var catId = await GetFirstCategoryIdAsync();

            var reqFree = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "Public Free Lemonade",
                    Ingredients = "Lemon, Water, Sugar",
                    CookingProcedure = "Mix all ingredients well.",
                    IsFree = true
                })
            };
            reqFree.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            await _client.SendAsync(reqFree);

            var reqPaid = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "Secret Five Star Sauce",
                    Ingredients = "Truffle oil, Cream",
                    CookingProcedure = "Simmer on low heat.",
                    IsFree = false
                })
            };
            reqPaid.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            await _client.SendAsync(reqPaid);

            // Act - Guest request (no auth header)
            var res = await _client.GetAsync("/api/recipes");

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<RecipeDto>>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotEmpty(body.Data!);

            // All recipes returned to guest MUST have IsFree == true
            Assert.All(body.Data!, r => Assert.True(r.IsFree));
            Assert.DoesNotContain(body.Data!, r => r.Title == "Secret Five Star Sauce");
        }

        [Fact]
        public async Task TC2_2_Member_Views_All_Recipes_Including_Paid()
        {
            // Arrange - Create a paid recipe as admin
            var (adminToken, _) = await GetAdminTokenAsync();
            var catId = await GetFirstCategoryIdAsync();

            var createPaidReq = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "Exclusive Member Wagyu Steak",
                    Ingredients = "A5 Wagyu, Sea salt",
                    CookingProcedure = "Sear on high heat.",
                    IsFree = false
                })
            };
            createPaidReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            await _client.SendAsync(createPaidReq);

            // Arrange - Login as member
            var (memberToken, _) = await CreateMemberAsync("recipe_viewer_member");

            // Act - Member request with Bearer token
            var req = new HttpRequestMessage(HttpMethod.Get, "/api/recipes");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<RecipeDto>>>();
            Assert.NotNull(body);
            Assert.True(body.Success);

            // Member can see premium recipes
            Assert.Contains(body.Data!, r => !r.IsFree);
        }

        [Fact]
        public async Task TC2_3_Admin_Views_All_Recipes()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();

            // Act
            var req = new HttpRequestMessage(HttpMethod.Get, "/api/recipes");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<RecipeDto>>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotEmpty(body.Data!);
        }

        [Fact]
        public async Task TC2_4_Search_Recipes_By_Keyword_Filters_Correctly()
        {
            // Arrange - Create a recipe with "Crispy Roast Chicken"
            var (adminToken, _) = await GetAdminTokenAsync();
            var catId = await GetFirstCategoryIdAsync();

            var req = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "Crispy Roast Chicken Supreme",
                    Ingredients = "Whole chicken, Rosemary, Garlic, Butter",
                    CookingProcedure = "Roast at 200C for 60 minutes.",
                    IsFree = true
                })
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            await _client.SendAsync(req);

            // Act - Search for "chicken"
            var res = await _client.GetAsync("/api/recipes?search=chicken");

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<RecipeDto>>>();
            Assert.NotNull(body);
            Assert.All(body.Data!, r =>
                Assert.True(r.Title.Contains("chicken", StringComparison.OrdinalIgnoreCase) ||
                            r.Ingredients.Contains("chicken", StringComparison.OrdinalIgnoreCase)));
        }

        [Fact]
        public async Task TC2_5_Filter_Recipes_By_Category_Returns_Only_Category_Items()
        {
            // Arrange
            var catId = await GetFirstCategoryIdAsync();

            // Act - Filter by categoryId
            var res = await _client.GetAsync($"/api/recipes?categoryId={catId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<RecipeDto>>>();
            Assert.NotNull(body);
            Assert.All(body.Data!, r => Assert.Equal(catId, r.CategoryId));
        }

        [Fact]
        public async Task TC2_6_Member_Creates_Recipe_Defaults_To_MembersOnly()
        {
            // Arrange
            var (memberToken, memberId) = await CreateMemberAsync("author_member_1");
            var catId = await GetFirstCategoryIdAsync();

            // Act - Member creates recipe
            var req = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "Member Gourmet Pasta",
                    Ingredients = "Penne, Cream, Mushrooms",
                    CookingProcedure = "Boil pasta and toss with sauce.",
                    IsFree = true // Member requests true, but system enforces false for member submissions
                })
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.Equal(memberId, body.Data!.AuthorId);
            Assert.False(body.Data.IsFree); // Member recipes are for members
        }

        [Fact]
        public async Task TC2_7_Admin_Creates_Recipe_And_Sets_IsFree_Properly()
        {
            // Arrange
            var (adminToken, adminId) = await GetAdminTokenAsync();
            var catId = await GetFirstCategoryIdAsync();

            // Act - Admin explicitly creates Free recipe
            var req = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "James Signature Gazpacho",
                    Ingredients = "Ripe tomatoes, Cucumbers, Bell peppers, Olive oil",
                    CookingProcedure = "Blend until smooth, chill for 2 hours.",
                    IsFree = true
                })
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>();
            Assert.NotNull(body);
            Assert.Equal(adminId, body.Data!.AuthorId);
            Assert.True(body.Data.IsFree);
        }

        [Fact]
        public async Task TC2_8_Member_Updates_Own_Recipe_Succeeds()
        {
            // Arrange - Member creates a recipe
            var (memberToken, _) = await CreateMemberAsync("editor_member_own");
            var catId = await GetFirstCategoryIdAsync();

            var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "Recipe Before Edit",
                    Ingredients = "Original ingredients",
                    CookingProcedure = "Original steps"
                })
            };
            createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var createRes = await _client.SendAsync(createReq);
            var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>();
            var recipeId = created!.Data!.RecipeId;

            // Act - Author edits own recipe
            var editReq = new HttpRequestMessage(HttpMethod.Put, $"/api/recipes/{recipeId}")
            {
                Content = JsonContent.Create(new UpdateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "Recipe After Edit",
                    Ingredients = "Updated ingredients",
                    CookingProcedure = "Updated steps"
                })
            };
            editReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var editRes = await _client.SendAsync(editReq);

            // Assert
            Assert.Equal(HttpStatusCode.OK, editRes.StatusCode);
            var body = await editRes.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>();
            Assert.NotNull(body);
            Assert.Equal("Recipe After Edit", body.Data!.Title);
            Assert.Equal("Updated ingredients", body.Data.Ingredients);
        }

        [Fact]
        public async Task TC2_9_Member_Updating_Another_Users_Recipe_Returns_Forbidden()
        {
            // Arrange - User A creates a recipe
            var (tokenA, _) = await CreateMemberAsync("user_author_a");
            var (tokenB, _) = await CreateMemberAsync("user_hacker_b");
            var catId = await GetFirstCategoryIdAsync();

            var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "User A Private Secret",
                    Ingredients = "A ingredients",
                    CookingProcedure = "A steps"
                })
            };
            createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenA);
            var createRes = await _client.SendAsync(createReq);
            var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>();
            var recipeId = created!.Data!.RecipeId;

            // Act - User B attempts to edit User A's recipe
            var hackReq = new HttpRequestMessage(HttpMethod.Put, $"/api/recipes/{recipeId}")
            {
                Content = JsonContent.Create(new UpdateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "Hacked by User B",
                    Ingredients = "Hacked",
                    CookingProcedure = "Hacked"
                })
            };
            hackReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenB);
            var hackRes = await _client.SendAsync(hackReq);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, hackRes.StatusCode);
        }

        [Fact]
        public async Task TC2_10_Member_Deletes_Own_Recipe_Succeeds()
        {
            // Arrange - Member creates a recipe
            var (memberToken, _) = await CreateMemberAsync("user_deleter");
            var catId = await GetFirstCategoryIdAsync();

            var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = "Recipe To Be Deleted",
                    Ingredients = "Sample",
                    CookingProcedure = "Sample"
                })
            };
            createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var createRes = await _client.SendAsync(createReq);
            var created = await createRes.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>();
            var recipeId = created!.Data!.RecipeId;

            // Act - Author deletes own recipe
            var deleteReq = new HttpRequestMessage(HttpMethod.Delete, $"/api/recipes/{recipeId}");
            deleteReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var deleteRes = await _client.SendAsync(deleteReq);

            // Assert
            Assert.Equal(HttpStatusCode.OK, deleteRes.StatusCode);

            // Verify deleted from database
            var getRes = await _client.GetAsync($"/api/recipes/{recipeId}");
            Assert.Equal(HttpStatusCode.NotFound, getRes.StatusCode);
        }

        [Fact]
        public async Task TC2_11_Guest_Creating_Recipe_Returns_Unauthorized()
        {
            // Act - Guest attempts to POST a recipe without Bearer token
            var catId = await GetFirstCategoryIdAsync();
            var res = await _client.PostAsJsonAsync("/api/recipes", new CreateRecipeRequest
            {
                CategoryId = catId,
                Title = "Guest Recipe",
                Ingredients = "Ingredients",
                CookingProcedure = "Steps"
            });

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
        }

        [Fact]
        public async Task TC2_12_Tips_Gatekeeping_And_Ownership_Works_Identically()
        {
            // 1. Admin creates 1 free tip and 1 paid tip
            var (adminToken, _) = await GetAdminTokenAsync();

            var postFreeTip = new HttpRequestMessage(HttpMethod.Post, "/api/tips")
            {
                Content = JsonContent.Create(new CreateTipRequest
                {
                    Title = "Public Salt Tip",
                    Content = "Add a pinch of salt to balance bitter flavors.",
                    IsFree = true
                })
            };
            postFreeTip.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            await _client.SendAsync(postFreeTip);

            var postPaidTip = new HttpRequestMessage(HttpMethod.Post, "/api/tips")
            {
                Content = JsonContent.Create(new CreateTipRequest
                {
                    Title = "Secret Knife Sharpening Tip",
                    Content = "Use a 15-degree angle with a Japanese whetstone.",
                    IsFree = false
                })
            };
            postPaidTip.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            await _client.SendAsync(postPaidTip);

            // 2. Guest request: only sees free tip
            var guestRes = await _client.GetAsync("/api/tips");
            Assert.Equal(HttpStatusCode.OK, guestRes.StatusCode);
            var guestTips = await guestRes.Content.ReadFromJsonAsync<ApiResponse<List<TipDto>>>();
            Assert.NotNull(guestTips);
            Assert.All(guestTips.Data!, t => Assert.True(t.IsFree));
            Assert.DoesNotContain(guestTips.Data!, t => t.Title == "Secret Knife Sharpening Tip");

            // 3. Member request: can see paid tips
            var (memberTokenA, _) = await CreateMemberAsync("tip_user_a");
            var memberReq = new HttpRequestMessage(HttpMethod.Get, "/api/tips");
            memberReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberTokenA);
            var memberRes = await _client.SendAsync(memberReq);
            var memberTips = await memberRes.Content.ReadFromJsonAsync<ApiResponse<List<TipDto>>>();
            Assert.Contains(memberTips!.Data!, t => !t.IsFree);

            // 4. Member A creates a tip
            var postMemberTip = new HttpRequestMessage(HttpMethod.Post, "/api/tips")
            {
                Content = JsonContent.Create(new CreateTipRequest
                {
                    Title = "User A Garlic Tip",
                    Content = "Crush garlic before mincing for maximum allicin."
                })
            };
            postMemberTip.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberTokenA);
            var tipCreatedRes = await _client.SendAsync(postMemberTip);
            var createdTip = await tipCreatedRes.Content.ReadFromJsonAsync<ApiResponse<TipDto>>();
            var tipId = createdTip!.Data!.TipId;

            // 5. Member B cannot edit Member A's tip
            var (memberTokenB, _) = await CreateMemberAsync("tip_user_b");
            var hackTipReq = new HttpRequestMessage(HttpMethod.Put, $"/api/tips/{tipId}")
            {
                Content = JsonContent.Create(new UpdateTipRequest
                {
                    Title = "Hacked Tip",
                    Content = "Hacked content"
                })
            };
            hackTipReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberTokenB);
            var hackTipRes = await _client.SendAsync(hackTipReq);
            Assert.Equal(HttpStatusCode.Forbidden, hackTipRes.StatusCode);

            // 6. Member A can delete their own tip
            var deleteTipReq = new HttpRequestMessage(HttpMethod.Delete, $"/api/tips/{tipId}");
            deleteTipReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberTokenA);
            var deleteTipRes = await _client.SendAsync(deleteTipReq);
            Assert.Equal(HttpStatusCode.OK, deleteTipRes.StatusCode);
        }

        [Fact]
        public async Task TC_F2_1_Filter_FreeOnly_And_MembersOnly_Recipes()
        {
            var (adminToken, _) = await GetAdminTokenAsync();
            var catId = await GetFirstCategoryIdAsync();

            // Create 1 free and 1 paid
            var freeTitle = "F2 Free Salad " + Guid.NewGuid().ToString("N")[..8];
            var paidTitle = "F2 Member Truffle " + Guid.NewGuid().ToString("N")[..8];

            var reqFree = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = freeTitle,
                    Ingredients = "Greens, Olive oil",
                    CookingProcedure = "Toss together.",
                    IsFree = true
                })
            };
            reqFree.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            await _client.SendAsync(reqFree);

            var reqPaid = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = paidTitle,
                    Ingredients = "Truffle, Butter",
                    CookingProcedure = "Melt slowly.",
                    IsFree = false
                })
            };
            reqPaid.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            await _client.SendAsync(reqPaid);

            // Admin query isFreeOnly=true
            var msgFreeOnly = new HttpRequestMessage(HttpMethod.Get, "/api/recipes?isFreeOnly=true");
            msgFreeOnly.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var resFreeOnly = await _client.SendAsync(msgFreeOnly);
            var bodyFree = await resFreeOnly.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<RecipeDto>>>();
            Assert.Contains(bodyFree!.Data!, r => r.Title == freeTitle);
            Assert.DoesNotContain(bodyFree.Data!, r => r.Title == paidTitle);

            // Admin query isFreeOnly=false
            var msgPaidOnly = new HttpRequestMessage(HttpMethod.Get, "/api/recipes?isFreeOnly=false");
            msgPaidOnly.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var resPaidOnly = await _client.SendAsync(msgPaidOnly);
            var bodyPaid = await resPaidOnly.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<RecipeDto>>>();
            Assert.Contains(bodyPaid!.Data!, r => r.Title == paidTitle);
            Assert.DoesNotContain(bodyPaid.Data!, r => r.Title == freeTitle);
        }

        [Fact]
        public async Task TC_2_15_ExpiredMember_CannotAccess_PaidRecipe_Returns403WithSubscriptionExpiredMessage()
        {
            var (adminToken, _) = await GetAdminTokenAsync();
            var catId = await GetFirstCategoryIdAsync();
            var uniqueId = Guid.NewGuid().ToString().Substring(0, 8);

            // 1. Admin creates a paid recipe
            var reqPaid = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
            {
                Content = JsonContent.Create(new CreateRecipeRequest
                {
                    CategoryId = catId,
                    Title = $"Exclusive Soufflé {uniqueId}",
                    Ingredients = "Egg whites, dark chocolate, sugar",
                    CookingProcedure = "Bake at 190C for 14 minutes.",
                    IsFree = false
                })
            };
            reqPaid.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var resPaid = await _client.SendAsync(reqPaid);
            var createdRecipe = (await resPaid.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>())!.Data!;

            // 2. Register a new member
            var (memberToken, memberUserId) = await CreateMemberAsync($"exp_{uniqueId}");

            // 3. Simulate subscription expiration by setting SubscriptionEnd to the past
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<backend.Data.ApplicationDbContext>();
                var user = await db.Users.FindAsync(memberUserId);
                if (user != null)
                {
                    user.SubscriptionEnd = DateTime.UtcNow.AddDays(-2);
                    await db.SaveChangesAsync();
                }
            }

            // 4. Expired member attempts to view paid recipe
            var getPaidReq = new HttpRequestMessage(HttpMethod.Get, $"/api/recipes/{createdRecipe.RecipeId}");
            getPaidReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var getPaidRes = await _client.SendAsync(getPaidReq);

            Assert.Equal(HttpStatusCode.Forbidden, getPaidRes.StatusCode);
            var errBody = await getPaidRes.Content.ReadFromJsonAsync<ApiResponse<RecipeDto>>();
            Assert.False(errBody!.Success);
            Assert.Contains("SUBSCRIPTION_EXPIRED", errBody.Message);

            // 5. Admin can still view paid recipe
            var adminGetReq = new HttpRequestMessage(HttpMethod.Get, $"/api/recipes/{createdRecipe.RecipeId}");
            adminGetReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var adminGetRes = await _client.SendAsync(adminGetReq);
            Assert.Equal(HttpStatusCode.OK, adminGetRes.StatusCode);
        }
    }
}
