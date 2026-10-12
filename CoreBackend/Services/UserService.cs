using CoreBackend.DTOs;
using CoreBackend.Entities;
using CoreBackend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CoreBackend.Services;

public interface IUserService
{
    Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(string? search, int page = 1, int pageSize = 10);
    Task<ApiResponse<UserDto>> GetUserByIdAsync(int id);
    Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserRequest request);
    Task<ApiResponse<UserDto>> UpdateUserAsync(int id, UpdateUserRequest request);
    Task<ApiResponse<bool>> SetUserStatusAsync(int id, bool isActive);
    Task<ApiResponse<bool>> SetUserLockAsync(int id, bool isLocked);
    Task<ApiResponse<bool>> AssignRolesAsync(int id, AssignRolesRequest request);
    Task<ApiResponse<bool>> DeleteUserAsync(int id);
}

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(string? search, int page = 1, int pageSize = 10)
    {
        var query = _unitOfWork.Users.Query()
            .Include(u => u.UserProfile)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower().Trim();
            query = query.Where(u => u.Username.ToLower().Contains(s) ||
                                     u.Email.ToLower().Contains(s) ||
                                     (u.UserProfile != null && u.UserProfile.FullName.ToLower().Contains(s)));
        }

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                Phone = u.Phone,
                IsActive = u.IsActive,
                IsLocked = u.IsLocked,
                FailedLogins = u.FailedLogins,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt,
                Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList(),
                Profile = u.UserProfile == null ? null : new UserProfileDto
                {
                    FullName = u.UserProfile.FullName,
                    Gender = u.UserProfile.Gender,
                    BirthDate = u.UserProfile.BirthDate,
                    Address = u.UserProfile.Address
                }
            }).ToListAsync();

        var result = new PagedResult<UserDto>
        {
            Items = items,
            TotalCount = total,
            PageNumber = page,
            PageSize = pageSize
        };

        return ApiResponse<PagedResult<UserDto>>.Ok(result);
    }

    public async Task<ApiResponse<UserDto>> GetUserByIdAsync(int id)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserProfile)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
            return ApiResponse<UserDto>.Fail("User not found.");

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

    public async Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserRequest request)
    {
        var exists = await _unitOfWork.Users.Query()
            .AnyAsync(u => u.Username.ToLower() == request.Username.ToLower() || u.Email.ToLower() == request.Email.ToLower());

        if (exists)
            return ApiResponse<UserDto>.Fail("Username or Email already exists.");

        var user = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone,
            IsActive = true,
            IsLocked = false,
            CreatedAt = DateTime.UtcNow,
            UserProfile = new UserProfile
            {
                FullName = string.IsNullOrWhiteSpace(request.FullName) ? request.Username : request.FullName.Trim()
            }
        };

        if (request.RoleIds != null && request.RoleIds.Any())
        {
            foreach (var rId in request.RoleIds)
            {
                user.UserRoles.Add(new UserRole { RoleId = rId });
            }
        }

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        return await GetUserByIdAsync(user.UserId);
    }

    public async Task<ApiResponse<UserDto>> UpdateUserAsync(int id, UpdateUserRequest request)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserProfile)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
            return ApiResponse<UserDto>.Fail("User not found.");

        user.Email = request.Email.Trim().ToLower();
        user.Phone = request.Phone;
        user.IsActive = request.IsActive;
        user.IsLocked = request.IsLocked;

        if (user.UserProfile == null)
        {
            user.UserProfile = new UserProfile { UserId = id };
        }

        user.UserProfile.FullName = request.FullName ?? string.Empty;
        user.UserProfile.Gender = request.Gender;
        user.UserProfile.BirthDate = request.BirthDate;
        user.UserProfile.Address = request.Address;

        await _unitOfWork.CompleteAsync();
        return await GetUserByIdAsync(id);
    }

    public async Task<ApiResponse<bool>> SetUserStatusAsync(int id, bool isActive)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return ApiResponse<bool>.Fail("User not found.");

        user.IsActive = isActive;
        await _unitOfWork.CompleteAsync();
        return ApiResponse<bool>.Ok(true, $"User active status updated to {isActive}.");
    }

    public async Task<ApiResponse<bool>> SetUserLockAsync(int id, bool isLocked)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return ApiResponse<bool>.Fail("User not found.");

        user.IsLocked = isLocked;
        if (!isLocked) user.FailedLogins = 0;
        await _unitOfWork.CompleteAsync();
        return ApiResponse<bool>.Ok(true, $"User lock status updated to {isLocked}.");
    }

    public async Task<ApiResponse<bool>> AssignRolesAsync(int id, AssignRolesRequest request)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null) return ApiResponse<bool>.Fail("User not found.");

        user.UserRoles.Clear();
        foreach (var rId in request.RoleIds)
        {
            user.UserRoles.Add(new UserRole { UserId = id, RoleId = rId });
        }

        await _unitOfWork.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Roles assigned successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteUserAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return ApiResponse<bool>.Fail("User not found.");

        _unitOfWork.Users.Remove(user);
        await _unitOfWork.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "User deleted successfully.");
    }
}
