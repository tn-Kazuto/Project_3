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
    /// Test suite for Phase 1: Authentication, Subscription Registration, User Profile, and Seed Data.
    /// Strictly verifies Test Cases TC1.1 through TC1.10 as defined in master-plan.md.
    /// </summary>
    public class Phase1Tests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public Phase1Tests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task TC1_1_Register_Monthly_Subscription_Succeeds()
        {
            // Arrange
            var req = new RegisterRequest
            {
                Username = "sarah_cook",
                FullName = "Sarah Jenkins",
                Email = "sarah@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                Phone = "+1234567890",
                PlanType = "MONTHLY",
                CardHolderName = "Sarah Jenkins",
                CardNumber = "4532123456789012",
                ExpiryDate = "12/28",
                Cvv = "123"
            };

            // Act
            var res = await _client.PostAsJsonAsync("/api/auth/register", req);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotNull(body.Data);
            Assert.NotEmpty(body.Data.Token);
            Assert.Equal("sarah_cook", body.Data.User.Username);
            Assert.Equal("MEMBER", body.Data.User.Role);
            Assert.Equal("MONTHLY", body.Data.User.SubscriptionPlan);
            Assert.Equal(10.00m, body.Data.User.SubscriptionAmount);
            Assert.True(body.Data.User.IsSubscriptionActive);
            Assert.NotNull(body.Data.User.SubscriptionEnd);

            // Verify subscription validity is approximately 30 days
            var diff = (body.Data.User.SubscriptionEnd.Value - DateTime.UtcNow).TotalDays;
            Assert.True(diff > 29 && diff <= 31);

            // Verify Payment record in database
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var payment = await db.Payments.FirstOrDefaultAsync(p => p.UserId == body.Data.User.UserId);
            Assert.NotNull(payment);
            Assert.Equal(10.00m, payment.Amount);
            Assert.Equal("MONTHLY", payment.PlanType);
            Assert.Equal("COMPLETED", payment.Status);
        }

        [Fact]
        public async Task TC1_2_Register_Yearly_Subscription_Succeeds()
        {
            // Arrange
            var req = new RegisterRequest
            {
                Username = "gordon_chef",
                FullName = "Gordon Green",
                Email = "gordon@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                PlanType = "YEARLY",
                CardHolderName = "Gordon Green",
                CardNumber = "5412123456789012",
                ExpiryDate = "11/29",
                Cvv = "456"
            };

            // Act
            var res = await _client.PostAsJsonAsync("/api/auth/register", req);

            // Assert
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            Assert.NotNull(body);
            Assert.Equal(100.00m, body.Data!.User.SubscriptionAmount);
            Assert.Equal("YEARLY", body.Data.User.SubscriptionPlan);

            // Verify subscription validity is approximately 365 days
            var diff = (body.Data.User.SubscriptionEnd!.Value - DateTime.UtcNow).TotalDays;
            Assert.True(diff > 364 && diff <= 366);
        }

        [Fact]
        public async Task TC1_3_Register_Missing_Plan_Returns_BadRequest()
        {
            // Arrange
            var req = new RegisterRequest
            {
                Username = "incomplete_user",
                FullName = "No Plan User",
                Email = "noplan@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                PlanType = "", // Empty plan
                CardHolderName = "Test",
                CardNumber = "1234567890123456",
                ExpiryDate = "12/26",
                Cvv = "999"
            };

            // Act
            var res = await _client.PostAsJsonAsync("/api/auth/register", req);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        }

        [Fact]
        public async Task TC1_4_Register_Duplicate_Email_Returns_Conflict()
        {
            // Arrange - Register initial user
            var req1 = new RegisterRequest
            {
                Username = "original_user",
                FullName = "Original User",
                Email = "duplicate@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                PlanType = "MONTHLY",
                CardHolderName = "Original",
                CardNumber = "1234",
                ExpiryDate = "12/28",
                Cvv = "111"
            };
            await _client.PostAsJsonAsync("/api/auth/register", req1);

            // Try registering with same email
            var req2 = new RegisterRequest
            {
                Username = "different_user",
                FullName = "Different Name",
                Email = "duplicate@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                PlanType = "MONTHLY",
                CardHolderName = "Different",
                CardNumber = "1234",
                ExpiryDate = "12/28",
                Cvv = "111"
            };

            // Act
            var res = await _client.PostAsJsonAsync("/api/auth/register", req2);

            // Assert
            Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
        }

        [Fact]
        public async Task TC1_5_Login_Success_Returns_Token_And_User()
        {
            // Arrange - Register user first
            var req = new RegisterRequest
            {
                Username = "login_test_user",
                FullName = "Login User",
                Email = "login_test@example.com",
                Password = "SecurePassword123!",
                ConfirmPassword = "SecurePassword123!",
                PlanType = "MONTHLY",
                CardHolderName = "Login User",
                CardNumber = "1234",
                ExpiryDate = "12/28",
                Cvv = "111"
            };
            await _client.PostAsJsonAsync("/api/auth/register", req);

            // Act - Login with email
            var loginReq = new LoginRequest
            {
                EmailOrUsername = "login_test@example.com",
                Password = "SecurePassword123!"
            };
            var res = await _client.PostAsJsonAsync("/api/auth/login", loginReq);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotEmpty(body.Data!.Token);
            Assert.Equal("login_test_user", body.Data.User.Username);
        }

        [Fact]
        public async Task TC1_6_Login_Wrong_Password_Returns_Unauthorized()
        {
            // Act
            var loginReq = new LoginRequest
            {
                EmailOrUsername = "james@jamesthew.com",
                Password = "WrongPassword999!"
            };
            var res = await _client.PostAsJsonAsync("/api/auth/login", loginReq);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
        }

        [Fact]
        public async Task TC1_7_Get_Profile_With_Valid_Token_Succeeds()
        {
            // Arrange - Login as admin
            var loginRes = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
            {
                EmailOrUsername = "james@jamesthew.com",
                Password = "Admin@123456"
            });
            var auth = await loginRes.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            var token = auth!.Data!.Token;

            // Act
            var req = new HttpRequestMessage(HttpMethod.Get, "/api/users/profile");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var res = await _client.SendAsync(req);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<UserDto>>();
            Assert.NotNull(body);
            Assert.Equal("James Thew", body.Data!.FullName);
            Assert.Equal("ADMIN", body.Data.Role);
        }

        [Fact]
        public async Task TC1_8_Get_Profile_Without_Token_Returns_Unauthorized()
        {
            // Act - Request without Bearer token
            var res = await _client.GetAsync("/api/users/profile");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
        }

        [Fact]
        public async Task TC1_9_Update_Profile_Succeeds()
        {
            // Arrange - Register & login a member
            var regReq = new RegisterRequest
            {
                Username = "profile_editor",
                FullName = "Initial Name",
                Email = "profile_editor@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                Phone = "+11111111",
                PlanType = "MONTHLY",
                CardHolderName = "Editor",
                CardNumber = "1234",
                ExpiryDate = "12/28",
                Cvv = "111"
            };
            var regRes = await _client.PostAsJsonAsync("/api/auth/register", regReq);
            var auth = await regRes.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            var token = auth!.Data!.Token;

            // Act - Update profile
            var updateReq = new HttpRequestMessage(HttpMethod.Put, "/api/users/profile")
            {
                Content = JsonContent.Create(new UpdateProfileRequest
                {
                    FullName = "Updated Name",
                    Phone = "+99999999"
                })
            };
            updateReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var res = await _client.SendAsync(updateReq);

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<UserDto>>();
            Assert.NotNull(body);
            Assert.Equal("Updated Name", body.Data!.FullName);
            Assert.Equal("+99999999", body.Data.Phone);
        }

        [Fact]
        public async Task TC1_10_Seed_Data_Integrity_Check()
        {
            // Verify Seed Data directly in DB
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // 1. Admin exists
            var admin = await db.Users.FirstOrDefaultAsync(u => u.Role == "ADMIN");
            Assert.NotNull(admin);
            Assert.Equal("James Thew", admin.FullName);
            Assert.Equal("james@jamesthew.com", admin.Email);

            // 2. Exactly 4 categories exist per SRS
            var categories = await db.Categories.ToListAsync();
            Assert.Equal(4, categories.Count);
            Assert.Contains(categories, c => c.CategoryName == "Juices");
            Assert.Contains(categories, c => c.CategoryName == "Vegetarian");
            Assert.Contains(categories, c => c.CategoryName == "Non-Vegetarian");
            Assert.Contains(categories, c => c.CategoryName == "Italian");

            // 3. Exactly 7 FAQs exist per SRS
            var faqs = await db.Faqs.OrderBy(f => f.DisplayOrder).ToListAsync();
            Assert.Equal(7, faqs.Count);
            Assert.Equal("How to become the member of this site?", faqs[0].Question);
            Assert.Equal("Will there be any subscription charges?", faqs[1].Question);
            Assert.Equal("How to view the recipes and tips? Will there be any charges for that?", faqs[2].Question);
            Assert.Equal("I am not the registered member of the site. Can I participate in the contest held?", faqs[3].Question);
            Assert.Equal("How to upload or post the recipes and tips?", faqs[4].Question);
            Assert.Equal("How to post a feedback?", faqs[5].Question);
            Assert.Equal("I have posted a recipe or a tip with respect to the contest. How can I know who is the winner?", faqs[6].Question);
        }

        [Fact]
        public async Task TC_F1_1_Renew_Subscription_Extends_Active_Plan()
        {
            // 1. Register a member
            var uniqueUser = $"renew_{Guid.NewGuid():N}"[..12];
            var regReq = new RegisterRequest
            {
                Username = uniqueUser,
                FullName = "Renew Tester",
                Email = $"{uniqueUser}@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                PlanType = "MONTHLY",
                CardHolderName = "Renew Tester",
                CardNumber = "4532123456789012",
                ExpiryDate = "12/28",
                Cvv = "123"
            };

            var regRes = await _client.PostAsJsonAsync("/api/auth/register", regReq);
            Assert.Equal(HttpStatusCode.Created, regRes.StatusCode);
            var regBody = await regRes.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            var initialEnd = regBody!.Data!.User.SubscriptionEnd!.Value;
            var token = regBody.Data.Token;

            // 2. Renew subscription using valid mock payment
            var renewReq = new RenewSubscriptionRequest
            {
                PlanType = "YEARLY",
                CardHolderName = "Renew Tester",
                CardNumber = "4532123456789012",
                ExpiryDate = "12/29",
                Cvv = "888"
            };

            var renewMsg = new HttpRequestMessage(HttpMethod.Post, "/api/users/subscription/renew");
            renewMsg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            renewMsg.Content = JsonContent.Create(renewReq);

            var renewRes = await _client.SendAsync(renewMsg);
            Assert.Equal(HttpStatusCode.OK, renewRes.StatusCode);

            var renewBody = await renewRes.Content.ReadFromJsonAsync<ApiResponse<UserDto>>();
            Assert.NotNull(renewBody);
            Assert.True(renewBody.Success);
            Assert.Equal("YEARLY", renewBody.Data!.SubscriptionPlan);
            Assert.Equal(100.00m, renewBody.Data.SubscriptionAmount);
            Assert.True(renewBody.Data.IsSubscriptionActive);
            // End date should have extended by 1 year from initial end date
            Assert.True(renewBody.Data.SubscriptionEnd!.Value > initialEnd.AddDays(360));

            // Verify second payment record exists in database
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var payments = await db.Payments.Where(p => p.UserId == renewBody.Data.UserId).ToListAsync();
            Assert.Equal(2, payments.Count);
        }

        [Fact]
        public async Task TC_F1_2_Renew_Subscription_Invalid_Plan_Fails()
        {
            var uniqueUser = $"failplan_{Guid.NewGuid():N}"[..12];
            var regReq = new RegisterRequest
            {
                Username = uniqueUser,
                FullName = "Fail Plan Tester",
                Email = $"{uniqueUser}@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                PlanType = "MONTHLY",
                CardHolderName = "Fail Plan",
                CardNumber = "4532123456789012",
                ExpiryDate = "12/28",
                Cvv = "123"
            };

            var regRes = await _client.PostAsJsonAsync("/api/auth/register", regReq);
            var regBody = await regRes.Content.ReadFromJsonAsync<ApiResponse<AuthResponseDto>>();
            var token = regBody!.Data!.Token;

            var renewReq = new RenewSubscriptionRequest
            {
                PlanType = "INVALID_TIER",
                CardHolderName = "Fail Plan",
                CardNumber = "4532123456789012",
                ExpiryDate = "12/29",
                Cvv = "888"
            };

            var renewMsg = new HttpRequestMessage(HttpMethod.Post, "/api/users/subscription/renew");
            renewMsg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            renewMsg.Content = JsonContent.Create(renewReq);

            var renewRes = await _client.SendAsync(renewMsg);
            Assert.Equal(HttpStatusCode.BadRequest, renewRes.StatusCode);
        }
    }
}

