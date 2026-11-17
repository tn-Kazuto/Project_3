using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using backend.Services;
using JamesThew.Shared.Contracts.DTOs.Billing;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace backend.tests
{
    public class RevenueStatsTests
    {
        private sealed class FakeBillingServiceClient : IBillingServiceClient
        {
            public bool IsEnabled => false;
            public Task<BillingSubscriptionDto> CreateRegistrationCheckoutAsync(User user, RegisterRequest request, CancellationToken cancellationToken = default) => throw new NotImplementedException();
            public Task<BillingSubscriptionDto> RenewSubscriptionAsync(User user, RenewSubscriptionRequest request, string idempotencyKey, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        }

        [Fact]
        public async Task GetRevenueStatsAsync_CalculatesMetricsCorrectly()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using var db = new ApplicationDbContext(options);

            var member1 = new User
            {
                UserId = 101,
                Username = "member1",
                FullName = "Alice Culinary",
                Email = "alice@example.com",
                Role = "MEMBER",
                SubscriptionPlan = "MONTHLY",
                SubscriptionAmount = 10.00m,
                SubscriptionStart = DateTime.UtcNow.AddDays(-10),
                SubscriptionEnd = DateTime.UtcNow.AddDays(20),
                PasswordHash = "hash"
            };

            var member2 = new User
            {
                UserId = 102,
                Username = "member2",
                FullName = "Bob Gourmet",
                Email = "bob@example.com",
                Role = "MEMBER",
                SubscriptionPlan = "YEARLY",
                SubscriptionAmount = 100.00m,
                SubscriptionStart = DateTime.UtcNow.AddDays(-50),
                SubscriptionEnd = DateTime.UtcNow.AddDays(315),
                PasswordHash = "hash"
            };

            var member3 = new User
            {
                UserId = 103,
                Username = "member3",
                FullName = "Charlie Expired",
                Email = "charlie@example.com",
                Role = "MEMBER",
                SubscriptionPlan = "MONTHLY",
                SubscriptionAmount = 10.00m,
                SubscriptionStart = DateTime.UtcNow.AddDays(-60),
                SubscriptionEnd = DateTime.UtcNow.AddDays(-30),
                PasswordHash = "hash"
            };

            db.Users.AddRange(member1, member2, member3);

            var payment1 = new Payment
            {
                PaymentId = 1,
                UserId = member1.UserId,
                User = member1,
                PlanType = "MONTHLY",
                Amount = 10.00m,
                PaymentDate = DateTime.UtcNow.AddDays(-10),
                Status = "COMPLETED"
            };

            var payment2 = new Payment
            {
                PaymentId = 2,
                UserId = member2.UserId,
                User = member2,
                PlanType = "YEARLY",
                Amount = 100.00m,
                PaymentDate = DateTime.UtcNow.AddDays(-50),
                Status = "SUCCESS"
            };

            var payment3 = new Payment
            {
                PaymentId = 3,
                UserId = member2.UserId,
                User = member2,
                PlanType = "ANNUAL",
                Amount = 100.00m,
                PaymentDate = DateTime.UtcNow.AddDays(-1),
                Status = "COMPLETED"
            };

            var failedPayment = new Payment
            {
                PaymentId = 4,
                UserId = member3.UserId,
                User = member3,
                PlanType = "MONTHLY",
                Amount = 10.00m,
                PaymentDate = DateTime.UtcNow.AddDays(-60),
                Status = "FAILED"
            };

            db.Payments.AddRange(payment1, payment2, payment3, failedPayment);
            await db.SaveChangesAsync();

            var uow = new UnitOfWork(db);
            var userService = new UserService(uow, billingServiceClient: new FakeBillingServiceClient());

            // Act
            var response = await userService.GetRevenueStatsAsync();

            // Assert
            Assert.True(response.Success);
            Assert.NotNull(response.Data);

            var stats = response.Data;
            Assert.Equal(210.00m, stats.TotalRevenue);
            Assert.Equal(10.00m, stats.MonthlyRevenue);
            Assert.Equal(200.00m, stats.YearlyRevenue);
            Assert.Equal(3, stats.TotalTransactions);
            Assert.Equal(1, stats.MonthlyTransactionsCount);
            Assert.Equal(2, stats.YearlyTransactionsCount);
            Assert.Equal(2, stats.ActiveSubscribersCount);
            Assert.Equal(1, stats.ExpiredSubscribersCount);
            Assert.Equal(3, stats.TotalMembersCount);

            // Recent transactions should exclude failed payment or list recent completed ones
            Assert.Equal(3, stats.RecentTransactions.Count);
            var topTransaction = stats.RecentTransactions[0];
            Assert.Equal(3, topTransaction.PaymentId);
            Assert.Equal("Bob Gourmet", topTransaction.FullName);
            Assert.Equal("YEARLY", topTransaction.PlanType);
        }
    }
}
