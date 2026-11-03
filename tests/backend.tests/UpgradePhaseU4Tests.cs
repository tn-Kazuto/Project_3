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
    /// Test suite for Phase U4: Community Contest Voting System & Anti-fraud Engine (SRS v2.0).
    /// Validates Member voting, Guest email voting, duplicate prevention, and live vote ranking.
    /// </summary>
    public class UpgradePhaseU4Tests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public UpgradePhaseU4Tests(CustomWebApplicationFactory factory)
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

        private async Task<string> CreateMemberAsync(string username)
        {
            var req = new RegisterRequest
            {
                Username = username,
                FullName = "Member " + username,
                Email = $"{username}@testcommunity.com",
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
            return body!.Data!.Token;
        }

        [Fact]
        public async Task TC_U4_1_Member_CanVoteForContestEntry_IncrementsVoteCount_AndPreventsDuplicateVote()
        {
            var adminToken = await GetAdminTokenAsync();
            var memberToken = await CreateMemberAsync($"voter_m_{Guid.NewGuid().ToString().Substring(0, 6)}");

            // Step 1: Admin creates an active recipe contest
            using var createContestReq = new HttpRequestMessage(HttpMethod.Post, "/api/contests");
            createContestReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            createContestReq.Content = JsonContent.Create(new CreateContestRequest
            {
                Title = "Haute Cuisine Autumn Championship",
                Description = "Craft an innovative French autumnal dessert.",
                ContestType = "RECIPE",
                StartDate = DateTime.UtcNow.AddDays(-1),
                EndDate = DateTime.UtcNow.AddDays(14),
                IsActive = true
            });
            var contestRes = await _client.SendAsync(createContestReq);
            Assert.Equal(HttpStatusCode.Created, contestRes.StatusCode);
            var contest = (await contestRes.Content.ReadFromJsonAsync<ApiResponse<ContestDto>>())!.Data!;

            // Step 2: Member submits an entry
            using var submitReq = new HttpRequestMessage(HttpMethod.Post, $"/api/contests/{contest.ContestId}/entries");
            submitReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            submitReq.Content = JsonContent.Create(new SubmitEntryRequest
            {
                Title = "Roasted Fig & Goat Cheese Tart",
                Ingredients = "Fresh figs, goat cheese, thyme, puff pastry, honey",
                CookingProcedure = "Bake puff pastry tartlet for 18 minutes until golden."
            });
            var submitRes = await _client.SendAsync(submitReq);
            Assert.Equal(HttpStatusCode.Created, submitRes.StatusCode);
            var entry = (await submitRes.Content.ReadFromJsonAsync<ApiResponse<ContestEntryDto>>())!.Data!;

            // Step 3: Member casts their community vote (Vote #1)
            using var voteReq1 = new HttpRequestMessage(HttpMethod.Post, $"/api/contests/entries/{entry.EntryId}/vote");
            voteReq1.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            voteReq1.Content = JsonContent.Create(new VoteContestEntryRequest());
            var voteRes1 = await _client.SendAsync(voteReq1);
            Assert.Equal(HttpStatusCode.OK, voteRes1.StatusCode);

            var voteBody1 = await voteRes1.Content.ReadFromJsonAsync<ApiResponse<ContestVoteResultDto>>();
            Assert.NotNull(voteBody1?.Data);
            Assert.True(voteBody1.Data.HasVoted);
            Assert.Equal(1, voteBody1.Data.NewVoteCount);

            // Step 4: Member attempts duplicate vote (should be rejected)
            using var voteReq2 = new HttpRequestMessage(HttpMethod.Post, $"/api/contests/entries/{entry.EntryId}/vote");
            voteReq2.Headers.Authorization = new AuthenticationHeaderValue("Bearer", memberToken);
            voteReq2.Content = JsonContent.Create(new VoteContestEntryRequest());
            var voteRes2 = await _client.SendAsync(voteReq2);
            Assert.Equal(HttpStatusCode.BadRequest, voteRes2.StatusCode);
            var voteBody2 = await voteRes2.Content.ReadFromJsonAsync<ApiResponse<ContestVoteResultDto>>();
            Assert.NotNull(voteBody2);
            Assert.False(voteBody2.Success);
            Assert.Contains("already voted", voteBody2.Message, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task TC_U4_2_Guest_CanVote_WithEmail_AndPreventsDuplicateEmail()
        {
            var adminToken = await GetAdminTokenAsync();

            // Admin creates contest
            using var createContestReq = new HttpRequestMessage(HttpMethod.Post, "/api/contests");
            createContestReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            createContestReq.Content = JsonContent.Create(new CreateContestRequest
            {
                Title = "Tasting Secrets Competition",
                Description = "Share your best secret kitchen trick.",
                ContestType = "TIP",
                StartDate = DateTime.UtcNow.AddDays(-1),
                EndDate = DateTime.UtcNow.AddDays(7),
                IsActive = true
            });
            var contestRes = await _client.SendAsync(createContestReq);
            var contest = (await contestRes.Content.ReadFromJsonAsync<ApiResponse<ContestDto>>())!.Data!;

            // Submit tip entry as guest
            var guestEntryRes = await _client.PostAsJsonAsync($"/api/contests/{contest.ContestId}/entries", new SubmitEntryRequest
            {
                Title = "Clarifying Consommé with Egg Whites",
                TipContent = "Whisk cold egg whites into chilled stock and simmer slowly without stirring.",
                GuestName = "Chef Pierre",
                GuestEmail = "pierre@gastronome.fr"
            });
            var entry = (await guestEntryRes.Content.ReadFromJsonAsync<ApiResponse<ContestEntryDto>>())!.Data!;

            string voterEmail = $"guest_voter_{Guid.NewGuid().ToString().Substring(0, 5)}@culinaryfan.com";

            // Guest vote 1 with email
            var vote1 = await _client.PostAsJsonAsync($"/api/contests/entries/{entry.EntryId}/vote", new VoteContestEntryRequest
            {
                GuestEmail = voterEmail
            });
            Assert.Equal(HttpStatusCode.OK, vote1.StatusCode);
            var voteBody1 = (await vote1.Content.ReadFromJsonAsync<ApiResponse<ContestVoteResultDto>>())!.Data!;
            Assert.Equal(1, voteBody1.NewVoteCount);

            // Duplicate vote with same email
            var vote2 = await _client.PostAsJsonAsync($"/api/contests/entries/{entry.EntryId}/vote", new VoteContestEntryRequest
            {
                GuestEmail = voterEmail
            });
            Assert.Equal(HttpStatusCode.BadRequest, vote2.StatusCode);
        }

        [Fact]
        public async Task TC_U4_3_GetEntries_WithOrderByVotes_ReturnsSortedByVoteCount()
        {
            var adminToken = await GetAdminTokenAsync();

            // Create contest
            using var createContestReq = new HttpRequestMessage(HttpMethod.Post, "/api/contests");
            createContestReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
            createContestReq.Content = JsonContent.Create(new CreateContestRequest
            {
                Title = "Quick Baking Championship",
                Description = "Fastest gourmet pastries.",
                ContestType = "RECIPE",
                StartDate = DateTime.UtcNow.AddDays(-1),
                EndDate = DateTime.UtcNow.AddDays(7),
                IsActive = true
            });
            var contestRes = await _client.SendAsync(createContestReq);
            var contest = (await contestRes.Content.ReadFromJsonAsync<ApiResponse<ContestDto>>())!.Data!;

            // Entry A (will have 0 votes)
            var entryARes = await _client.PostAsJsonAsync($"/api/contests/{contest.ContestId}/entries", new SubmitEntryRequest
            {
                Title = "Entry A - Plain Brioche",
                Ingredients = "Flour, butter, eggs, yeast",
                CookingProcedure = "Bake at 180C for 25 mins",
                GuestName = "Baker A",
                GuestEmail = "bakerA@example.com"
            });
            var entryA = (await entryARes.Content.ReadFromJsonAsync<ApiResponse<ContestEntryDto>>())!.Data!;

            // Entry B (will receive 1 vote)
            var entryBRes = await _client.PostAsJsonAsync($"/api/contests/{contest.ContestId}/entries", new SubmitEntryRequest
            {
                Title = "Entry B - Grand Cru Chocolate Tart",
                Ingredients = "Chocolate 70%, butter, cream, sablé crust",
                CookingProcedure = "Pour ganache into pre-baked sablé crust.",
                GuestName = "Baker B",
                GuestEmail = "bakerB@example.com"
            });
            var entryB = (await entryBRes.Content.ReadFromJsonAsync<ApiResponse<ContestEntryDto>>())!.Data!;

            // Vote for Entry B
            var voteRes = await _client.PostAsJsonAsync($"/api/contests/entries/{entryB.EntryId}/vote", new VoteContestEntryRequest
            {
                GuestEmail = $"fan_{Guid.NewGuid().ToString().Substring(0, 5)}@chocolatelover.com"
            });
            Assert.Equal(HttpStatusCode.OK, voteRes.StatusCode);

            // Fetch sorted by votes via public community-entries endpoint
            var listRes = await _client.GetAsync($"/api/contests/{contest.ContestId}/community-entries?orderByVotes=true");
            Assert.Equal(HttpStatusCode.OK, listRes.StatusCode);
            var list = (await listRes.Content.ReadFromJsonAsync<ApiResponse<List<ContestEntryDto>>>())!.Data!;

            Assert.True(list.Count >= 2);
            // Entry B should be first because it has 1 vote vs Entry A's 0 votes
            var first = list.First();
            Assert.Equal(entryB.EntryId, first.EntryId);
            Assert.True(first.VoteCount > 0);
        }
    }
}

