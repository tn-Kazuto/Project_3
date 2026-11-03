using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.DTOs;
using Xunit;

namespace backend.tests
{
    /// <summary>
    /// Test suite for Phase 3: Contests & Announcements APIs.
    /// Strictly verifies Test Cases TC3.1 through TC3.11 as defined in master-plan.md.
    /// </summary>
    public class Phase3Tests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public Phase3Tests(CustomWebApplicationFactory factory)
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

        private async Task<int> CreateSampleContestAsync(string token, string title, string type = "RECIPE")
        {
            var req = new HttpRequestMessage(HttpMethod.Post, "/api/contests")
            {
                Content = JsonContent.Create(new CreateContestRequest
                {
                    Title = title,
                    Description = "Annual competition hosted by Chef James Thew.",
                    ContestType = type,
                    StartDate = DateTime.UtcNow.AddDays(-1),
                    EndDate = DateTime.UtcNow.AddDays(30),
                    IsActive = true
                })
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var res = await _client.SendAsync(req);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<ContestDto>>();
            return body!.Data!.ContestId;
        }

        [Fact]
        public async Task TC3_1_Admin_Creates_New_Contest_Succeeds()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();

            var req = new HttpRequestMessage(HttpMethod.Post, "/api/contests")
            {
                Content = JsonContent.Create(new CreateContestRequest
                {
                    Title = "Summer Pasta Master 2026",
                    Description = "Create your best summer pasta dish.",
                    ContestType = "RECIPE",
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(14),
                    IsActive = true
                })
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

            // Act
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<ContestDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.Equal("Summer Pasta Master 2026", body.Data!.Title);
            Assert.Equal("RECIPE", body.Data.ContestType);
        }

        [Fact]
        public async Task TC3_2_Member_Creating_Contest_Returns_Forbidden()
        {
            // Arrange - Member tries to create a contest
            var (memberToken, _) = await CreateMemberAsync("contest_wannabe_admin");

            var req = new HttpRequestMessage(HttpMethod.Post, "/api/contests")
            {
                Content = JsonContent.Create(new CreateContestRequest
                {
                    Title = "Member Unauthorized Contest",
                    Description = "Should be rejected.",
                    ContestType = "TIP",
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(7)
                })
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);

            // Act
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
        }

        [Fact]
        public async Task TC3_3_Guest_Submits_Contest_Entry_Succeeds()
        {
            // Arrange - Admin creates contest
            var (adminToken, _) = await GetAdminTokenAsync();
            var contestId = await CreateSampleContestAsync(adminToken, "Guest Entry Test Contest", "RECIPE");

            // Act - Unauthenticated guest submits entry with name and email
            var entryReq = new SubmitEntryRequest
            {
                Title = "Grandma's Secret Lasagna",
                Ingredients = "Lasagna sheets, Bolognese, Béchamel, Mozzarella",
                CookingProcedure = "Layer pasta and sauce, bake for 45 mins at 180C.",
                GuestName = "Emily Watson",
                GuestEmail = "emily.watson@example.com"
            };
            var res = await _client.PostAsJsonAsync($"/api/contests/{contestId}/entries", entryReq);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<ContestEntryDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.True(body.Data!.IsGuest);
            Assert.Null(body.Data.UserId);
            Assert.Equal("Emily Watson", body.Data.SubmitterName);
            Assert.Equal("emily.watson@example.com", body.Data.SubmitterEmail);
        }

        [Fact]
        public async Task TC3_4_Member_Submits_Contest_Entry_Succeeds()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();
            var contestId = await CreateSampleContestAsync(adminToken, "Member Entry Contest", "TIP");

            var (memberToken, memberId) = await CreateMemberAsync("contest_submitter_member");

            // Act - Member submits tip entry
            var entryReq = new HttpRequestMessage(HttpMethod.Post, $"/api/contests/{contestId}/entries")
            {
                Content = JsonContent.Create(new SubmitEntryRequest
                {
                    Title = "Perfect Poached Egg Tip",
                    TipContent = "Add vinegar to simmering water and create a gentle vortex."
                })
            };
            entryReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var res = await _client.SendAsync(entryReq);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<ContestEntryDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.False(body.Data!.IsGuest);
            Assert.Equal(memberId, body.Data.UserId);
        }

        [Fact]
        public async Task TC3_5_Guest_Submitting_Without_Name_Returns_BadRequest()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();
            var contestId = await CreateSampleContestAsync(adminToken, "Validation Check Contest", "RECIPE");

            // Act - Guest misses guest name
            var entryReq = new SubmitEntryRequest
            {
                Title = "Anonymous Entry",
                Ingredients = "Some ingredients",
                CookingProcedure = "Some procedure",
                GuestName = "", // Missing
                GuestEmail = "anon@example.com"
            };
            var res = await _client.PostAsJsonAsync($"/api/contests/{contestId}/entries", entryReq);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        }

        [Fact]
        public async Task TC3_6_Admin_Views_All_Contest_Entries()
        {
            // Arrange - Create contest with entries
            var (adminToken, _) = await GetAdminTokenAsync();
            var contestId = await CreateSampleContestAsync(adminToken, "Admin Review Contest", "RECIPE");

            // Submit 1 entry
            await _client.PostAsJsonAsync($"/api/contests/{contestId}/entries", new SubmitEntryRequest
            {
                Title = "Contest Entry For Review",
                Ingredients = "Eggs, Flour",
                CookingProcedure = "Bake",
                GuestName = "Reviewer",
                GuestEmail = "rev@example.com"
            });

            // Act - Admin requests entries
            var req = new HttpRequestMessage(HttpMethod.Get, $"/api/contests/{contestId}/entries");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<ContestEntryDto>>>();
            Assert.NotNull(body);
            Assert.NotEmpty(body.Data!);
            Assert.Contains(body.Data!, e => e.Title == "Contest Entry For Review");
        }

        [Fact]
        public async Task TC3_7_Member_Viewing_Contest_Entries_Returns_Forbidden()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();
            var contestId = await CreateSampleContestAsync(adminToken, "Protected Entries Contest", "RECIPE");

            var (memberToken, _) = await CreateMemberAsync("curious_member");

            // Act - Member tries to view all entries
            var req = new HttpRequestMessage(HttpMethod.Get, $"/api/contests/{contestId}/entries");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
        }

        [Fact]
        public async Task TC3_8_Admin_Selects_Winner_Entry()
        {
            // Arrange - Create contest and entry
            var (adminToken, _) = await GetAdminTokenAsync();
            var contestId = await CreateSampleContestAsync(adminToken, "Championship Contest", "RECIPE");

            var entryRes = await _client.PostAsJsonAsync($"/api/contests/{contestId}/entries", new SubmitEntryRequest
            {
                Title = "Golden Winner Dish",
                Ingredients = "Caviar, Gold leaf",
                CookingProcedure = "Plate delicately",
                GuestName = "Chef Champion",
                GuestEmail = "champ@example.com"
            });
            var entryBody = await entryRes.Content.ReadFromJsonAsync<ApiResponse<ContestEntryDto>>();
            var entryId = entryBody!.Data!.EntryId;

            // Act - Admin selects winner
            var winReq = new HttpRequestMessage(HttpMethod.Put, $"/api/contests/entries/{entryId}/winner");
            winReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var res = await _client.SendAsync(winReq);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<ContestEntryDto>>();
            Assert.NotNull(body);
            Assert.True(body.Data!.IsWinner);
        }

        [Fact]
        public async Task TC3_9_Admin_Publishes_Announcement_Succeeds()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();

            var req = new HttpRequestMessage(HttpMethod.Post, "/api/announcements")
            {
                Content = JsonContent.Create(new CreateAnnouncementRequest
                {
                    Title = "Announcement: Summer 2026 Winner Declared!",
                    Content = "Chef James Thew is thrilled to congratulate Chef Champion for winning first place."
                })
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

            // Act
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<AnnouncementDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.Equal("Announcement: Summer 2026 Winner Declared!", body.Data!.Title);
        }

        [Fact]
        public async Task TC3_10_Guest_Views_Announcements_Publicly()
        {
            // Act - Public guest GET request
            var res = await _client.GetAsync("/api/announcements");

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<List<AnnouncementDto>>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotEmpty(body.Data!);
        }

        [Fact]
        public async Task TC3_11_Admin_Deletes_Contest_Succeeds()
        {
            // Arrange
            var (adminToken, _) = await GetAdminTokenAsync();
            var contestId = await CreateSampleContestAsync(adminToken, "Contest To Be Deleted", "RECIPE");

            // Act - Admin deletes contest
            var req = new HttpRequestMessage(HttpMethod.Delete, $"/api/contests/{contestId}");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);

            // Verify contest is not found anymore
            var getRes = await _client.GetAsync($"/api/contests/{contestId}");
            Assert.Equal(HttpStatusCode.NotFound, getRes.StatusCode);
        }

        [Fact]
        public async Task TC_F3_1_Selecting_Winner_Publishes_Announcement()
        {
            var (adminToken, _) = await GetAdminTokenAsync();
            var contestId = await CreateSampleContestAsync(adminToken, "Grand Prix de Cuisine " + Guid.NewGuid().ToString("N")[..6], "RECIPE");

            var entryRes = await _client.PostAsJsonAsync($"/api/contests/{contestId}/entries", new SubmitEntryRequest
            {
                Title = "Truffle En Croute",
                Ingredients = "Black truffle, Puff pastry",
                CookingProcedure = "Bake golden",
                GuestName = "Antoine Carême",
                GuestEmail = "careme@culinary.fr"
            });
            var entryBody = await entryRes.Content.ReadFromJsonAsync<ApiResponse<ContestEntryDto>>();
            var entryId = entryBody!.Data!.EntryId;

            // Admin selects winner
            var winReq = new HttpRequestMessage(HttpMethod.Put, $"/api/contests/entries/{entryId}/winner");
            winReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            var winRes = await _client.SendAsync(winReq);
            Assert.Equal(HttpStatusCode.OK, winRes.StatusCode);

            // Verify announcement was automatically generated
            var annRes = await _client.GetAsync("/api/announcements");
            Assert.Equal(HttpStatusCode.OK, annRes.StatusCode);
            var annBody = await annRes.Content.ReadFromJsonAsync<ApiResponse<List<AnnouncementDto>>>();
            Assert.NotNull(annBody?.Data);
            Assert.Contains(annBody.Data, a => a.WinnerEntryId == entryId || a.Title.Contains("Truffle En Croute"));
        }
    }
}

