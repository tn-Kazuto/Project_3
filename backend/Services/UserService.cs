using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using backend.Services.EventBus;
using JamesThew.Shared.Contracts.DTOs.Billing;
using JamesThew.Shared.Contracts.Events;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    /// <summary>
    /// User profile management service implementing inline/modal profile updates and security checks.
    /// </summary>
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _uow;
        private readonly INotificationService? _notificationService;
        private readonly IEmailService? _emailService;
        private readonly IEventBus? _eventBus;
        private readonly ILogger<UserService>? _logger;
        private readonly IBillingServiceClient _billingServiceClient;

        public UserService(
            IUnitOfWork uow,
            INotificationService? notificationService = null,
            IEmailService? emailService = null,
            IEventBus? eventBus = null,
            ILogger<UserService>? logger = null,
            IBillingServiceClient? billingServiceClient = null)
        {
            _uow = uow;
            _notificationService = notificationService;
            _emailService = emailService;
            _eventBus = eventBus;
            _logger = logger;
            _billingServiceClient = billingServiceClient ?? throw new InvalidOperationException("Billing service client is required.");
        }

        public async Task<ApiResponse<UserDto>> GetProfileAsync(int userId)
        {
            var user = await _uow.Repository<User>().GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<UserDto>.Fail("User account not found.");
            }

            return ApiResponse<UserDto>.Ok(MapToDto(user));
        }

        public async Task<ApiResponse<UserDto>> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            var userRepo = _uow.Repository<User>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<UserDto>.Fail("User account not found.");
            }

            user.FullName = request.FullName.Trim();
            user.Phone = request.Phone?.Trim();

            userRepo.Update(user);
            await _uow.SaveChangesAsync();

            return ApiResponse<UserDto>.Ok(MapToDto(user), "Profile updated successfully.");
        }

        public async Task<ApiResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            var userRepo = _uow.Repository<User>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse.Fail("User account not found.");
            }

            bool passwordCorrect = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
            if (!passwordCorrect)
            {
                return ApiResponse.Fail("Current password is incorrect.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            userRepo.Update(user);
            await _uow.SaveChangesAsync();

            return ApiResponse.Ok("Password changed successfully.");
        }

        public async Task<ApiResponse<UserDto>> RenewSubscriptionAsync(
            int userId,
            RenewSubscriptionRequest request,
            string idempotencyKey)
        {
            return _billingServiceClient.IsEnabled
                ? await RenewWithBillingAsync(userId, request, idempotencyKey)
                : await RenewLegacyAsync(userId, request);
        }

        private async Task<ApiResponse<UserDto>> RenewWithBillingAsync(
            int userId,
            RenewSubscriptionRequest request,
            string idempotencyKey)
        {
            var userRepo = _uow.Repository<User>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user is null) return ApiResponse<UserDto>.Fail("User account not found.");

            try
            {
                var subscription = await _billingServiceClient.RenewSubscriptionAsync(user, request, idempotencyKey);
                ApplySubscription(user, subscription);
                userRepo.Update(user);
                await _uow.SaveChangesAsync();
                return ApiResponse<UserDto>.Ok(MapToDto(user), "Subscription pass successfully renewed!");
            }
            catch (BillingServiceException exception)
            {
                _logger?.LogWarning(exception, "Billing checkout could not be confirmed for user {UserId}.", userId);
                return ApiResponse<UserDto>.Fail(exception.Message);
            }
        }

        private async Task<ApiResponse<UserDto>> RenewLegacyAsync(int userId, RenewSubscriptionRequest request)
        {
            var planUpper = request.PlanType.Trim().ToUpperInvariant();
            if (planUpper != "MONTHLY" && planUpper != "YEARLY" && planUpper != "ANNUAL")
            {
                return ApiResponse<UserDto>.Fail("Invalid plan type. Must be MONTHLY ($10) or YEARLY ($100).");
            }

            var cleanCard = request.CardNumber.Replace(" ", "").Replace("-", "");
            if (cleanCard.Length < 12 || cleanCard.Length > 19 || !cleanCard.All(char.IsDigit))
            {
                return ApiResponse<UserDto>.Fail("Invalid mock card number. Must be between 12 and 19 digits.");
            }

            var userRepo = _uow.Repository<User>();
            var paymentRepo = _uow.Repository<Payment>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<UserDto>.Fail("User account not found.");
            }

            decimal amount = (planUpper == "MONTHLY") ? 10.00m : 100.00m;
            var now = DateTime.UtcNow;

            DateTime baseDate = (user.SubscriptionEnd.HasValue && user.SubscriptionEnd.Value > now)
                ? user.SubscriptionEnd.Value
                : now;

            DateTime newSubscriptionEnd = (planUpper == "MONTHLY")
                ? baseDate.AddDays(30)
                : baseDate.AddYears(1);

            user.SubscriptionPlan = (planUpper == "ANNUAL") ? "YEARLY" : planUpper;
            user.SubscriptionAmount = amount;
            if (!user.SubscriptionStart.HasValue)
            {
                user.SubscriptionStart = now;
            }
            user.SubscriptionEnd = newSubscriptionEnd;

            userRepo.Update(user);

            var payment = new Payment
            {
                UserId = user.UserId,
                PlanType = user.SubscriptionPlan,
                Amount = amount,
                PaymentDate = now,
                Status = "COMPLETED"
            };

            await paymentRepo.AddAsync(payment);
            await _uow.SaveChangesAsync();

            // Trigger in-app notification & renewal receipt email (Phase U5)
            try
            {
                if (_notificationService != null)
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                    {
                        UserId = user.UserId,
                        Title = "VIP Pass Renewal Confirmed",
                        Message = $"Your {user.SubscriptionPlan} pass has been extended until {newSubscriptionEnd:d}.",
                        TargetUrl = "/profile"
                    });
                }

                if (_emailService != null)
                {
                    _ = _emailService.SendWelcomeMembershipEmailAsync(user.Email, user.FullName, user.SubscriptionPlan ?? "VIP", amount);
                }

                if (_eventBus != null)
                {
                    await _eventBus.PublishAsync(
                        "jamesthew.events",
                        "subscription.activated",
                        new SubscriptionActivatedEvent(
                            user.UserId,
                            user.Email,
                            user.SubscriptionPlan ?? planUpper,
                            amount,
                            now,
                            newSubscriptionEnd,
                            now));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Non-blocking notification/email dispatch failed while renewing subscription for user {UserId}", user.UserId);
            }

            return ApiResponse<UserDto>.Ok(MapToDto(user), "Subscription pass successfully renewed!");
        }

        public async Task<ApiResponse<JamesThew.Shared.Contracts.DTOs.Common.PagedResult<UserDto>>> GetAdminUsersPagedAsync(
            int page,
            int pageSize,
            string? search,
            string? role,
            string? subscriptionStatus)
        {
            var query = _uow.Repository<User>().QueryReadOnly().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(term) ||
                    u.Email.ToLower().Contains(term) ||
                    u.Username.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(role) && role.Trim().ToUpperInvariant() != "ALL")
            {
                var roleTerm = role.Trim().ToUpperInvariant();
                query = query.Where(u => u.Role == roleTerm);
            }

            if (!string.IsNullOrWhiteSpace(subscriptionStatus) && subscriptionStatus.Trim().ToUpperInvariant() != "ALL")
            {
                var statusTerm = subscriptionStatus.Trim().ToUpperInvariant();
                var now = DateTime.UtcNow;
                if (statusTerm == "ACTIVE")
                {
                    query = query.Where(u => u.Role == "ADMIN" || (u.SubscriptionEnd.HasValue && u.SubscriptionEnd.Value > now));
                }
                else if (statusTerm == "EXPIRED")
                {
                    query = query.Where(u => u.Role == "MEMBER" && (!u.SubscriptionEnd.HasValue || u.SubscriptionEnd.Value <= now));
                }
            }

            var totalCount = await query.CountAsync();
            var pageIndex = Math.Max(1, page);
            var safePageSize = Math.Clamp(pageSize, 1, 50);

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((pageIndex - 1) * safePageSize)
                .Take(safePageSize)
                .ToListAsync();

            var items = users.Select(MapToDto).ToList();

            var pagedResult = new JamesThew.Shared.Contracts.DTOs.Common.PagedResult<UserDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = safePageSize
            };

            return ApiResponse<JamesThew.Shared.Contracts.DTOs.Common.PagedResult<UserDto>>.Ok(pagedResult);
        }

        public async Task<ApiResponse<RevenueStatsDto>> GetRevenueStatsAsync()
        {
            var paymentRepo = _uow.Repository<Payment>();
            var userRepo = _uow.Repository<User>();

            var payments = await paymentRepo.QueryReadOnly()
                .Where(p => p.Status == "COMPLETED" || p.Status == "SUCCESS")
                .ToListAsync();

            var totalRevenue = payments.Sum(p => p.Amount);

            var monthlyPayments = payments.Where(p =>
                string.Equals(p.PlanType, "MONTHLY", StringComparison.OrdinalIgnoreCase)).ToList();
            var yearlyPayments = payments.Where(p =>
                string.Equals(p.PlanType, "YEARLY", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(p.PlanType, "ANNUAL", StringComparison.OrdinalIgnoreCase)).ToList();

            var monthlyRevenue = monthlyPayments.Sum(p => p.Amount);
            var yearlyRevenue = yearlyPayments.Sum(p => p.Amount);

            var users = await userRepo.QueryReadOnly()
                .Where(u => u.Role == "MEMBER")
                .ToListAsync();

            var now = DateTime.UtcNow;
            var activeSubscribers = users.Count(u => u.SubscriptionEnd.HasValue && u.SubscriptionEnd.Value > now);
            var expiredSubscribers = users.Count(u => !u.SubscriptionEnd.HasValue || u.SubscriptionEnd.Value <= now);
            var totalMembers = users.Count;

            var recentPayments = await paymentRepo.QueryReadOnly()
                .Where(p => p.Status == "COMPLETED" || p.Status == "SUCCESS")
                .Include(p => p.User)
                .OrderByDescending(p => p.PaymentDate)
                .Take(20)
                .ToListAsync();

            var recentTransactionDtos = recentPayments.Select(p => new PaymentTransactionDto
            {
                PaymentId = p.PaymentId,
                UserId = p.UserId,
                UserName = p.User != null ? p.User.Username : $"Member #{p.UserId}",
                FullName = p.User != null ? p.User.FullName : $"Member #{p.UserId}",
                Email = p.User != null ? p.User.Email : string.Empty,
                PlanType = NormalizePlanType(p.PlanType),
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                Status = p.Status
            }).ToList();

            var dto = new RevenueStatsDto
            {
                TotalRevenue = totalRevenue,
                MonthlyRevenue = monthlyRevenue,
                YearlyRevenue = yearlyRevenue,
                TotalTransactions = payments.Count,
                MonthlyTransactionsCount = monthlyPayments.Count,
                YearlyTransactionsCount = yearlyPayments.Count,
                ActiveSubscribersCount = activeSubscribers,
                ExpiredSubscribersCount = expiredSubscribers,
                TotalMembersCount = totalMembers,
                RecentTransactions = recentTransactionDtos
            };

            return ApiResponse<RevenueStatsDto>.Ok(dto);
        }

        private static string NormalizePlanType(string? planType)
        {
            if (string.IsNullOrWhiteSpace(planType)) return "MONTHLY";
            var upper = planType.Trim().ToUpperInvariant();
            if (upper == "ANNUAL" || upper == "YEARLY") return "YEARLY";
            return "MONTHLY";
        }

        private static UserDto MapToDto(User user)
        {
            bool isActiveSubscription = user.Role == "ADMIN" ||
                (user.SubscriptionEnd.HasValue && user.SubscriptionEnd.Value > DateTime.UtcNow);

            return new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                Role = user.Role,
                SubscriptionPlan = user.SubscriptionPlan,
                SubscriptionAmount = user.SubscriptionAmount,
                SubscriptionStart = user.SubscriptionStart,
                SubscriptionEnd = user.SubscriptionEnd,
                IsSubscriptionActive = isActiveSubscription,
                CreatedAt = user.CreatedAt
            };
        }

        private static void ApplySubscription(User user, BillingSubscriptionDto subscription)
        {
            user.SubscriptionPlan = subscription.PlanType;
            user.SubscriptionAmount = subscription.Amount;
            user.SubscriptionStart = subscription.StartDate;
            user.SubscriptionEnd = subscription.EndDate;
        }
    }
}

