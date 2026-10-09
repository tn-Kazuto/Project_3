using CoreBackend.DTOs;
using CoreBackend.Entities;
using CoreBackend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CoreBackend.Services;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent);
    Task<ApiResponse<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress, string? userAgent);
    Task<ApiResponse<bool>> RevokeTokenAsync(string token);
    Task<ApiResponse<bool>> ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<ApiResponse<UserDto>> GetCurrentUserProfileAsync(int userId);
    Task<ApiResponse<UserDto>> UpdateCurrentUserProfileAsync(int userId, UpdateProfileRequest request);
}

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthService(IUnitOfWork unitOfWork, ITokenService tokenService, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _unitOfWork.Users.Query()
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower() || u.Email.ToLower() == request.Email.ToLower());

        if (existingUser != null)
        {
            return ApiResponse<AuthResponse>.Fail("Username or Email is already registered.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var newUser = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = passwordHash,
            Phone = request.Phone,
            IsActive = true,
            IsLocked = false,
            CreatedAt = DateTime.UtcNow,
            UserProfile = new UserProfile
            {
                FullName = string.IsNullOrWhiteSpace(request.FullName) ? request.Username : request.FullName.Trim()
            }
        };

        // Assign default User role if exists
        var defaultRole = await _unitOfWork.Roles.Query().FirstOrDefaultAsync(r => r.RoleName == "User");
        if (defaultRole != null)
        {
            newUser.UserRoles.Add(new UserRole { Role = defaultRole });
        }

        await _unitOfWork.Users.AddAsync(newUser);
        await _unitOfWork.CompleteAsync();

        // Generate response
        var roles = newUser.UserRoles.Select(ur => ur.Role.RoleName).ToList();
        var permissions = new List<string>();

        var accessToken = _tokenService.GenerateAccessToken(newUser, roles, permissions);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenDays = int.TryParse(_configuration["Jwt:RefreshTokenExpiryDays"], out var days) ? days : 7;
        var expiresAt = DateTime.UtcNow.AddDays(refreshTokenDays);

        var session = new UserSession
        {
            UserId = newUser.UserId,
            Token = refreshToken,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            IsRevoked = false
        };

        await _unitOfWork.UserSessions.AddAsync(session);
        await _unitOfWork.CompleteAsync();

        var response = new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            User = new UserSummaryDto
            {
                UserId = newUser.UserId,
                Username = newUser.Username,
                Email = newUser.Email,
                FullName = newUser.UserProfile.FullName,
                Roles = roles,
                Permissions = permissions
            }
        };

        return ApiResponse<AuthResponse>.Ok(response, "Registration successful");
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserProfile)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());

        // Login history tracking helper
        async Task RecordLoginAttempt(bool success, int? uid)
        {
            await _unitOfWork.LoginHistories.AddAsync(new LoginHistory
            {
                UserId = uid,
                Username = request.Username,
                IsSuccess = success,
                IpAddress = ipAddress,
                LoginAt = DateTime.UtcNow
            });
            await _unitOfWork.CompleteAsync();
        }

        if (user == null)
        {
            await RecordLoginAttempt(false, null);
            return ApiResponse<AuthResponse>.Fail("Invalid username or password.");
        }

        if (user.IsLocked)
        {
            await RecordLoginAttempt(false, user.UserId);
            return ApiResponse<AuthResponse>.Fail("Your account is locked. Please contact support.");
        }

        if (!user.IsActive)
        {
            await RecordLoginAttempt(false, user.UserId);
            return ApiResponse<AuthResponse>.Fail("Your account is disabled.");
        }

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            user.FailedLogins += 1;
            if (user.FailedLogins >= 5)
            {
                user.IsLocked = true;
            }
            await _unitOfWork.CompleteAsync();
            await RecordLoginAttempt(false, user.UserId);

            return ApiResponse<AuthResponse>.Fail(user.IsLocked
                ? "Account has been locked due to 5 consecutive failed login attempts."
                : "Invalid username or password.");
        }

        // Reset failed logins & update last login time
        user.FailedLogins = 0;
        user.LastLoginAt = DateTime.UtcNow;

        var roles = user.UserRoles.Select(ur => ur.Role.RoleName).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.PermissionCode)
            .Distinct()
            .ToList();

        var accessToken = _tokenService.GenerateAccessToken(user, roles, permissions);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenDays = int.TryParse(_configuration["Jwt:RefreshTokenExpiryDays"], out var days) ? days : 7;
        var expiresAt = DateTime.UtcNow.AddDays(refreshTokenDays);

        var session = new UserSession
        {
            UserId = user.UserId,
            Token = refreshToken,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            IsRevoked = false
        };

        await _unitOfWork.UserSessions.AddAsync(session);
        await _unitOfWork.CompleteAsync();
        await RecordLoginAttempt(true, user.UserId);

        var response = new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            User = new UserSummaryDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FullName = user.UserProfile?.FullName,
                Roles = roles,
                Permissions = permissions
            }
        };

        return ApiResponse<AuthResponse>.Ok(response, "Login successful");
    }

    public async Task<ApiResponse<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress, string? userAgent)
    {
        var session = await _unitOfWork.UserSessions.Query()
            .Include(s => s.User)
                .ThenInclude(u => u.UserProfile)
            .Include(s => s.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(s => s.Token == request.RefreshToken);

        if (session == null || session.IsRevoked || session.ExpiresAt <= DateTime.UtcNow)
        {
            return ApiResponse<AuthResponse>.Fail("Invalid or expired refresh token.");
        }

        var user = session.User;
        if (!user.IsActive || user.IsLocked)
        {
            return ApiResponse<AuthResponse>.Fail("User account is inactive or locked.");
        }

        // Token rotation: revoke current session token and issue a new one
        session.IsRevoked = true;

        var roles = user.UserRoles.Select(ur => ur.Role.RoleName).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.PermissionCode)
            .Distinct()
            .ToList();

        var newAccessToken = _tokenService.GenerateAccessToken(user, roles, permissions);
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenDays = int.TryParse(_configuration["Jwt:RefreshTokenExpiryDays"], out var days) ? days : 7;
        var expiresAt = DateTime.UtcNow.AddDays(refreshTokenDays);

        var newSession = new UserSession
        {
            UserId = user.UserId,
            Token = newRefreshToken,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            IsRevoked = false
        };

        await _unitOfWork.UserSessions.AddAsync(newSession);
        await _unitOfWork.CompleteAsync();

        var response = new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = expiresAt,
            User = new UserSummaryDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FullName = user.UserProfile?.FullName,
                Roles = roles,
                Permissions = permissions
            }
        };

        return ApiResponse<AuthResponse>.Ok(response, "Token refreshed successfully");
    }

    public async Task<ApiResponse<bool>> RevokeTokenAsync(string token)
    {
        var session = await _unitOfWork.UserSessions.Query().FirstOrDefaultAsync(s => s.Token == token);
        if (session == null)
        {
            return ApiResponse<bool>.Fail("Token not found.");
        }

        session.IsRevoked = true;
        await _unitOfWork.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Token revoked successfully.");
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            return ApiResponse<bool>.Fail("User not found.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return ApiResponse<bool>.Fail("Current password does not match.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        return ApiResponse<bool>.Ok(true, "Password changed successfully.");
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserProfileAsync(int userId)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserProfile)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("User not found.");
        }

        var dto = new UserDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            Phone = user.Phone,
            IsActive = user.IsActive,
            IsLocked = user.IsLocked,
            FailedLogins = user.FailedLogins,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            Roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList(),
            Profile = user.UserProfile == null ? null : new UserProfileDto
            {
                FullName = user.UserProfile.FullName,
                Gender = user.UserProfile.Gender,
                BirthDate = user.UserProfile.BirthDate,
                Address = user.UserProfile.Address
            }
        };

        return ApiResponse<UserDto>.Ok(dto);
    }

    public async Task<ApiResponse<UserDto>> UpdateCurrentUserProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserProfile)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("User not found.");
        }

        user.Phone = request.Phone;
        if (user.UserProfile == null)
        {
            user.UserProfile = new UserProfile { UserId = user.UserId };
        }

        user.UserProfile.FullName = request.FullName;
        user.UserProfile.Gender = request.Gender;
        user.UserProfile.BirthDate = request.BirthDate;
        user.UserProfile.Address = request.Address;

        await _unitOfWork.CompleteAsync();
        return await GetCurrentUserProfileAsync(userId);
    }
}
