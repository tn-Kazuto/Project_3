using System.Globalization;
using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using backend.Services.EventBus;
using JamesThew.Shared.Contracts.Constants;
using JamesThew.Shared.Contracts.Events;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    /// <summary>
    /// Implements registration with mandatory subscription payment, login,
    /// and refresh token lifecycle (token rotation, revocation, and validation).
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _uow;
        private readonly ITokenService _tokenService;
        private readonly INotificationService? _notificationService;
        private readonly IEmailService? _emailService;
        private readonly IEventBus? _eventBus;
        private readonly ILogger<AuthService>? _logger;

        public AuthService(
            IUnitOfWork uow, 
            ITokenService tokenService,
            INotificationService? notificationService = null,
            IEmailService? emailService = null,
            IEventBus? eventBus = null,
            ILogger<AuthService>? logger = null)
        {
            _uow = uow;
            _tokenService = tokenService;
            _notificationService = notificationService;
            _emailService = emailService;
            _eventBus = eventBus;
            _logger = logger;
        }

        public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequest request, string? ipAddress = null)
        {
            // 1. Validate subscription plan
            var planUpper = request.PlanType.Trim().ToUpperInvariant();
            if (planUpper != AppConstants.Plans.Monthly && planUpper != AppConstants.Plans.Yearly && planUpper != AppConstants.Plans.Annual)
            {
                return ApiResponse<AuthResponseDto>.Fail(
                    "Invalid subscription plan. Allowed options: 'MONTHLY' ($10) or 'YEARLY' ($100).");
            }

            decimal amount = planUpper == AppConstants.Plans.Monthly ? AppConstants.Plans.MonthlyPrice : AppConstants.Plans.AnnualPrice;
            int validityDays = planUpper == AppConstants.Plans.Monthly ? AppConstants.Plans.MonthlyDurationDays : AppConstants.Plans.AnnualDurationDays;

            // 2. Validate mock payment fields
            if (string.IsNullOrWhiteSpace(request.CardNumber) ||
                string.IsNullOrWhiteSpace(request.CardHolderName) ||
                string.IsNullOrWhiteSpace(request.ExpiryDate) ||
                string.IsNullOrWhiteSpace(request.Cvv))
            {
                return ApiResponse<AuthResponseDto>.Fail("Payment information is incomplete.");
            }

            var userRepo = _uow.Repository<User>();
            var paymentRepo = _uow.Repository<Payment>();
            var tokenRepo = _uow.Repository<RefreshToken>();

            // 3. Check for duplicates
            var emailExists = await userRepo.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (emailExists)
            {
                return ApiResponse<AuthResponseDto>.Fail("An account with this email address already exists.");
            }

            var usernameExists = await userRepo.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower());
            if (usernameExists)
            {
                return ApiResponse<AuthResponseDto>.Fail("Username is already taken. Please choose another.");
            }

            // 4. Begin transaction for atomic User + Payment + RefreshToken creation
            await _uow.BeginTransactionAsync();
            try
            {
                var now = DateTime.UtcNow;
                var subscriptionEnd = now.AddDays(validityDays);

                var user = new User
                {
                    Username = request.Username.Trim(),
                    Email = request.Email.Trim().ToLowerInvariant(),
                    FullName = request.FullName.Trim(),
                    Phone = request.Phone?.Trim(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    Role = AppConstants.Roles.Member,
                    SubscriptionPlan = planUpper,
                    SubscriptionAmount = amount,
                    SubscriptionStart = now,
                    SubscriptionEnd = subscriptionEnd,
                    CreatedAt = now
                };

                await userRepo.AddAsync(user);
                await _uow.SaveChangesAsync(); // Generates UserId

                var payment = new Payment
                {
                    UserId = user.UserId,
                    PlanType = planUpper,
                    Amount = amount,
                    PaymentDate = now,
                    Status = "COMPLETED"
                };

                await paymentRepo.AddAsync(payment);

                // Generate and persist refresh token
                var refreshToken = _tokenService.GenerateRefreshToken(ipAddress);
                refreshToken.UserId = user.UserId;
                await tokenRepo.AddAsync(refreshToken);

                await _uow.SaveChangesAsync();
                await _uow.CommitTransactionAsync();

                // Trigger in-app notification & transactional welcome email
                try
                {
                    if (_notificationService != null)
                    {
                        var formattedAmount = amount.ToString("F2", CultureInfo.InvariantCulture);
                        await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                        {
                            UserId = user.UserId,
                            Title = "Welcome to Chef James Thew VIP Pass!",
                            Message = $"Your {planUpper} pass (${formattedAmount}) is activated. Enjoy full access to exclusive recipes, masterclasses, and community contests.",
                            TargetUrl = "/recipes"
                        });
                    }

                    if (_emailService != null)
                    {
                        _ = _emailService.SendWelcomeMembershipEmailAsync(user.Email, user.FullName, planUpper, amount);
                    }

                    if (_eventBus != null)
                    {
                        await _eventBus.PublishAsync(
                            "jamesthew.events",
                            "subscription.activated",
                            new SubscriptionActivatedEvent(
                                user.UserId,
                                user.Email,
                                planUpper,
                                amount,
                                now,
                                subscriptionEnd,
                                now
                            ));
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Non-blocking dispatch failed during registration for user {UserId}", user.UserId);
                }

                // 5. Generate JWT Access token
                var (token, expiresAt) = _tokenService.GenerateJwtToken(user);
                var userDto = MapToUserDto(user);

                return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
                {
                    Token = token,
                    ExpiresAt = expiresAt,
                    RefreshToken = refreshToken.Token,
                    User = userDto
                }, "Registration and subscription payment completed successfully!");
            }
            catch (Exception ex)
            {
                await _uow.RollbackTransactionAsync();
                return ApiResponse<AuthResponseDto>.Fail($"Registration failed: {ex.Message}");
            }
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequest request, string? ipAddress = null)
        {
            var userRepo = _uow.Repository<User>();
            var tokenRepo = _uow.Repository<RefreshToken>();
            var identifier = request.EmailOrUsername.Trim().ToLowerInvariant();

            var user = await userRepo.FirstOrDefaultAsync(u =>
                u.Email.ToLower() == identifier || u.Username.ToLower() == identifier);

            if (user == null)
            {
                return ApiResponse<AuthResponseDto>.Fail("Invalid email/username or password.");
            }

            bool passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!passwordValid)
            {
                return ApiResponse<AuthResponseDto>.Fail("Invalid email/username or password.");
            }

            // Generate JWT token & Refresh Token
            var (token, expiresAt) = _tokenService.GenerateJwtToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken(ipAddress);
            refreshToken.UserId = user.UserId;

            await tokenRepo.AddAsync(refreshToken);
            await _uow.SaveChangesAsync();

            var userDto = MapToUserDto(user);

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                RefreshToken = refreshToken.Token,
                User = userDto
            }, "Login successful!");
        }

        public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string token, string? ipAddress = null)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return ApiResponse<AuthResponseDto>.Fail("Refresh token is required.");
            }

            var tokenRepo = _uow.Repository<RefreshToken>();
            var refreshToken = await tokenRepo.Query()
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == token);

            if (refreshToken == null)
            {
                return ApiResponse<AuthResponseDto>.Fail("Invalid refresh token.");
            }

            if (refreshToken.IsRevoked)
            {
                return ApiResponse<AuthResponseDto>.Fail("Refresh token has been revoked.");
            }

            if (refreshToken.IsExpired)
            {
                return ApiResponse<AuthResponseDto>.Fail("Refresh token has expired.");
            }

            // Rotate refresh token: revoke old token and issue new one
            var newRefreshToken = _tokenService.GenerateRefreshToken(ipAddress);
            newRefreshToken.UserId = refreshToken.UserId;

            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.ReplacedByToken = newRefreshToken.Token;

            tokenRepo.Update(refreshToken);
            await tokenRepo.AddAsync(newRefreshToken);
            await _uow.SaveChangesAsync();

            // Generate new access token
            var (newJwtToken, expiresAt) = _tokenService.GenerateJwtToken(refreshToken.User);
            var userDto = MapToUserDto(refreshToken.User);

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = newJwtToken,
                ExpiresAt = expiresAt,
                RefreshToken = newRefreshToken.Token,
                User = userDto
            }, "Token refreshed successfully.");
        }

        public async Task<ApiResponse<bool>> RevokeTokenAsync(string token, string? ipAddress = null)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return ApiResponse<bool>.Fail("Refresh token is required.");
            }

            var tokenRepo = _uow.Repository<RefreshToken>();
            var refreshToken = await tokenRepo.FirstOrDefaultAsync(r => r.Token == token);

            if (refreshToken == null || !refreshToken.IsActive)
            {
                return ApiResponse<bool>.Fail("Token not found or already inactive.");
            }

            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;

            tokenRepo.Update(refreshToken);
            await _uow.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Token revoked successfully.");
        }

        public async Task<ApiResponse<UserDto>> GetCurrentUserAsync(int userId)
        {
            var user = await _uow.Repository<User>().GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<UserDto>.Fail("User not found.");
            }

            return ApiResponse<UserDto>.Ok(MapToUserDto(user));
        }

        private static UserDto MapToUserDto(User user)
        {
            bool isActiveSubscription = user.Role == AppConstants.Roles.Admin ||
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
