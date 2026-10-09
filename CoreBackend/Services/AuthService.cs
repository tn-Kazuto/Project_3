using CoreBackend.DTOs;
using CoreBackend.Entities;
using CoreBackend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CoreBackend.Services;

public interface IAuthService
{
    // Đăng ký cho người dùng thường
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);

    // Đăng ký Quản trị viên (Admin / Manager)
    Task<ApiResponse<AuthResponse>> RegisterAdminAsync(AdminRegisterRequest request);

    // Đăng nhập chung hoặc kiểm tra quyền Quản trị viên
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent, bool requireAdminRole = false);

    // Quản lý Token & Profile
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

    // 1. Đăng ký tài khoản Người dùng (User)
    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _unitOfWork.Users.Query()
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower() || u.Email.ToLower() == request.Email.ToLower());

        if (existingUser != null)
        {
            return ApiResponse<AuthResponse>.Fail("Tên đăng nhập hoặc Email này đã tồn tại trong hệ thống.");
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
            FailedLogins = 0,
            CreatedAt = DateTime.UtcNow,
            UserProfile = new UserProfile
            {
                FullName = request.FullName.Trim(),
                Gender = request.Gender,
                BirthDate = request.BirthDate,
                Address = request.Address
            }
        };

        // Gán Role "User" mặc định
        var defaultRole = await _unitOfWork.Roles.Query().FirstOrDefaultAsync(r => r.RoleName == "User");
        if (defaultRole != null)
        {
            newUser.UserRoles.Add(new UserRole { Role = defaultRole });
        }

        await _unitOfWork.Users.AddAsync(newUser);
        await _unitOfWork.CompleteAsync();

        // Ghi AuditLog
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            UserId = newUser.UserId,
            Action = "REGISTER_USER",
            TableName = "Users",
            RecordId = newUser.UserId.ToString(),
            NewValue = $"User {newUser.Username} registered successfully",
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.CompleteAsync();

        return await GenerateAuthResponseAsync(newUser, null, null, "Đăng ký tài khoản thành công!");
    }

    // 2. Đăng ký tài khoản Quản trị viên (Admin / Manager)
    public async Task<ApiResponse<AuthResponse>> RegisterAdminAsync(AdminRegisterRequest request)
    {
        // Kiểm tra Secret Key bảo vệ quyền Admin
        var configuredSecret = _configuration["AdminSecretKey"] ?? "AdminCoreMasterKey@2026";
        if (request.AdminSecretKey != configuredSecret)
        {
            return ApiResponse<AuthResponse>.Fail("Mã bí mật xác thực quyền Admin không chính xác. Bạn không được phép tạo tài khoản quản trị.");
        }

        var existingUser = await _unitOfWork.Users.Query()
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower() || u.Email.ToLower() == request.Email.ToLower());

        if (existingUser != null)
        {
            return ApiResponse<AuthResponse>.Fail("Tên đăng nhập hoặc Email này đã tồn tại trong hệ thống.");
        }

        var targetRoleName = string.Equals(request.RoleName, "Manager", StringComparison.OrdinalIgnoreCase) ? "Manager" : "Admin";
        var adminRole = await _unitOfWork.Roles.Query().FirstOrDefaultAsync(r => r.RoleName == targetRoleName);
        if (adminRole == null)
        {
            adminRole = new Role { RoleName = targetRoleName, Description = $"{targetRoleName} Role" };
            await _unitOfWork.Roles.AddAsync(adminRole);
            await _unitOfWork.CompleteAsync();
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var newAdmin = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = passwordHash,
            Phone = request.Phone,
            IsActive = true,
            IsLocked = false,
            FailedLogins = 0,
            CreatedAt = DateTime.UtcNow,
            UserProfile = new UserProfile
            {
                FullName = request.FullName.Trim(),
                Gender = request.Gender,
                BirthDate = request.BirthDate,
                Address = request.Address
            }
        };

        newAdmin.UserRoles.Add(new UserRole { Role = adminRole });

        await _unitOfWork.Users.AddAsync(newAdmin);
        await _unitOfWork.CompleteAsync();

        // Ghi AuditLog
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            UserId = newAdmin.UserId,
            Action = "REGISTER_ADMIN",
            TableName = "Users",
            RecordId = newAdmin.UserId.ToString(),
            NewValue = $"Admin {newAdmin.Username} ({targetRoleName}) registered successfully",
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.CompleteAsync();

        return await GenerateAuthResponseAsync(newAdmin, null, null, $"Tạo tài khoản quản trị viên ({targetRoleName}) thành công!");
    }

    // 3. Đăng nhập (hỗ trợ phân biệt Cổng Người Dùng vs Cổng Quản Trị)
    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent, bool requireAdminRole = false)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserProfile)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower() || u.Email.ToLower() == request.Username.ToLower());

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
            return ApiResponse<AuthResponse>.Fail("Tên đăng nhập hoặc mật khẩu không chính xác.");
        }

        if (user.IsLocked)
        {
            await RecordLoginAttempt(false, user.UserId);
            return ApiResponse<AuthResponse>.Fail("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.");
        }

        if (!user.IsActive)
        {
            await RecordLoginAttempt(false, user.UserId);
            return ApiResponse<AuthResponse>.Fail("Tài khoản của bạn đang bị vô hiệu hóa.");
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
                ? "Tài khoản của bạn đã bị khóa tự động do nhập sai mật khẩu 5 lần liên tiếp."
                : "Tên đăng nhập hoặc mật khẩu không chính xác.");
        }

        var userRoles = user.UserRoles.Select(ur => ur.Role.RoleName).Distinct().ToList();

        // Kiểm tra quyền nếu là cổng đăng nhập Admin
        if (requireAdminRole)
        {
            bool hasAdminPrivilege = userRoles.Any(r => string.Equals(r, "Admin", StringComparison.OrdinalIgnoreCase) ||
                                                        string.Equals(r, "Manager", StringComparison.OrdinalIgnoreCase));
            if (!hasAdminPrivilege)
            {
                await RecordLoginAttempt(false, user.UserId);
                return ApiResponse<AuthResponse>.Fail("Từ chối truy cập: Cổng Quản trị này chỉ dành cho tài khoản Admin hoặc Manager.");
            }
        }

        // Đăng nhập thành công -> Reset số lần đăng nhập sai và cập nhật thời gian
        user.FailedLogins = 0;
        user.LastLoginAt = DateTime.UtcNow;
        await _unitOfWork.CompleteAsync();
        await RecordLoginAttempt(true, user.UserId);

        var message = requireAdminRole ? "Đăng nhập Cổng Quản Trị thành công!" : "Đăng nhập thành công!";
        return await GenerateAuthResponseAsync(user, ipAddress, userAgent, message);
    }

    // Helper tạo Token & Session lưu vào bảng UserSessions
    private async Task<ApiResponse<AuthResponse>> GenerateAuthResponseAsync(User user, string? ipAddress, string? userAgent, string successMessage)
    {
        // Nạp lại roles & permissions nếu cần
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
                Phone = user.Phone,
                FullName = user.UserProfile?.FullName,
                Gender = user.UserProfile?.Gender,
                BirthDate = user.UserProfile?.BirthDate,
                Address = user.UserProfile?.Address,
                IsActive = user.IsActive,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt,
                Roles = roles,
                Permissions = permissions
            }
        };

        return ApiResponse<AuthResponse>.Ok(response, successMessage);
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
            return ApiResponse<AuthResponse>.Fail("Refresh Token không hợp lệ hoặc đã hết hạn.");
        }

        var user = session.User;
        if (!user.IsActive || user.IsLocked)
        {
            return ApiResponse<AuthResponse>.Fail("Tài khoản người dùng đã bị khóa hoặc vô hiệu hóa.");
        }

        // Hủy session token cũ
        session.IsRevoked = true;
        await _unitOfWork.CompleteAsync();

        // Cấp session token mới
        return await GenerateAuthResponseAsync(user, ipAddress, userAgent, "Gia hạn Token thành công!");
    }

    public async Task<ApiResponse<bool>> RevokeTokenAsync(string token)
    {
        var session = await _unitOfWork.UserSessions.Query().FirstOrDefaultAsync(s => s.Token == token);
        if (session == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy phiên đăng nhập tương ứng.");
        }

        session.IsRevoked = true;
        await _unitOfWork.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Đã thu hồi phiên đăng nhập thành công.");
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            return ApiResponse<bool>.Fail("Không tìm thấy người dùng.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return ApiResponse<bool>.Fail("Mật khẩu hiện tại không chính xác.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        _unitOfWork.Users.Update(user);

        // Ghi AuditLog
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            Action = "CHANGE_PASSWORD",
            TableName = "Users",
            RecordId = userId.ToString(),
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Đổi mật khẩu thành công.");
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserProfileAsync(int userId)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserProfile)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("Không tìm thấy người dùng.");
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
            return ApiResponse<UserDto>.Fail("Không tìm thấy người dùng.");
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
