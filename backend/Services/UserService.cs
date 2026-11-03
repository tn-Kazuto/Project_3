using backend.DTOs;
using backend.Entities;
using backend.Repositories;

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

        public UserService(
            IUnitOfWork uow,
            INotificationService? notificationService = null,
            IEmailService? emailService = null)
        {
            _uow = uow;
            _notificationService = notificationService;
            _emailService = emailService;
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

        public async Task<ApiResponse<UserDto>> RenewSubscriptionAsync(int userId, RenewSubscriptionRequest request)
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
            }
            catch
            {
                // Non-blocking notification/email dispatch
            }

            return ApiResponse<UserDto>.Ok(MapToDto(user), "Subscription pass successfully renewed!");
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
    }
}

