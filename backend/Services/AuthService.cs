using backend.DTOs;
using backend.Entities;
using backend.Repositories;

namespace backend.Services
{
    /// <summary>
    /// Implements registration with mandatory subscription payment, login, and user context operations.
    /// Follows the SRS specifications:
    /// - Monthly plan: $10.00, valid for 30 days
    /// - Yearly plan: $100.00, valid for 365 days
    /// - Customer can register provided he makes the payment
    /// - All in a single database transaction
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _uow;
        private readonly ITokenService _tokenService;
        private readonly INotificationService? _notificationService;
        private readonly IEmailService? _emailService;

        public AuthService(
            IUnitOfWork uow, 
            ITokenService tokenService,
            INotificationService? notificationService = null,
            IEmailService? emailService = null)
        {
            _uow = uow;
            _tokenService = tokenService;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequest request)
        {
            // 1. Validate subscription plan
            var planUpper = request.PlanType.Trim().ToUpperInvariant();
            if (planUpper != "MONTHLY" && planUpper != "YEARLY")
            {
                return ApiResponse<AuthResponseDto>.Fail(
                    "Invalid subscription plan. Allowed options: 'MONTHLY' ($10) or 'YEARLY' ($100).");
            }

            decimal amount = planUpper == "MONTHLY" ? 10.00m : 100.00m;
            int validityDays = planUpper == "MONTHLY" ? 30 : 365;

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

            // 4. Begin transaction for atomic User + Payment creation
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
                    Role = "MEMBER",
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
                await _uow.SaveChangesAsync();

                await _uow.CommitTransactionAsync();

                // Trigger in-app notification & transactional welcome email (Phase U5)
                try
                {
                    if (_notificationService != null)
                    {
                        await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                        {
                            UserId = user.UserId,
                            Title = "Welcome to Chef James Thew VIP Pass!",
                            Message = $"Your {planUpper} pass (${amount:N2}) is activated. Enjoy full access to exclusive recipes, masterclasses, and community contests.",
                            TargetUrl = "/recipes"
                        });
                    }

                    if (_emailService != null)
                    {
                        _ = _emailService.SendWelcomeMembershipEmailAsync(user.Email, user.FullName, planUpper, amount);
                    }
                }
                catch
                {
                    // Non-blocking notification/email dispatch
                }

                // 5. Generate token
                var (token, expiresAt) = _tokenService.GenerateJwtToken(user);

                var userDto = MapToUserDto(user);

                return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
                {
                    Token = token,
                    ExpiresAt = expiresAt,
                    User = userDto
                }, "Registration and subscription payment completed successfully!");
            }
            catch (Exception ex)
            {
                await _uow.RollbackTransactionAsync();
                return ApiResponse<AuthResponseDto>.Fail($"Registration failed: {ex.Message}");
            }
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequest request)
        {
            var userRepo = _uow.Repository<User>();
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

            var (token, expiresAt) = _tokenService.GenerateJwtToken(user);
            var userDto = MapToUserDto(user);

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = userDto
            }, "Login successful!");
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

