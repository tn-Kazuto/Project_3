using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Data;
using webapi.DTOs;
using webapi.Models;
using webapi.Services;

namespace webapi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, IJwtService jwtService, ILogger<AuthController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _logger = logger;
    }

    /// <summary>
    /// Đăng ký tài khoản mới
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });
        }

        var normalizedUsername = request.Username.Trim().ToLower();
        var normalizedEmail = request.Email.Trim().ToLower();

        // Kiểm tra xem username hoặc email đã tồn tại chưa
        var existsUsername = await _context.Users.AnyAsync(u => u.Username.ToLower() == normalizedUsername);
        if (existsUsername)
        {
            return BadRequest(new { message = "Tên đăng nhập này đã được sử dụng." });
        }

        var existsEmail = await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail);
        if (existsEmail)
        {
            return BadRequest(new { message = "Email này đã được sử dụng." });
        }

        // Tạo người dùng mới với mật khẩu được mã hóa BCrypt
        var newUser = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim(),
            FullName = string.IsNullOrWhiteSpace(request.FullName) ? request.Username.Trim() : request.FullName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "User", // Mặc định là User
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Người dùng mới đã đăng ký: {Username}", newUser.Username);

        // Tạo JWT Token cho người dùng mới đăng ký
        var token = _jwtService.GenerateToken(newUser, out var expiresAt);

        var response = new AuthResponseDto
        {
            Token = token,
            TokenType = "Bearer",
            ExpiresAt = expiresAt,
            User = new UserProfileDto
            {
                Id = newUser.Id,
                Username = newUser.Username,
                Email = newUser.Email,
                FullName = newUser.FullName,
                Role = newUser.Role,
                CreatedAt = newUser.CreatedAt
            }
        };

        return Ok(response);
    }

    /// <summary>
    /// Đăng nhập hệ thống (bằng Username hoặc Email)
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Dữ liệu không hợp lệ" });
        }

        var query = request.UsernameOrEmail.Trim().ToLower();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == query || u.Email.ToLower() == query);

        if (user == null)
        {
            return Unauthorized(new { message = "Tên đăng nhập / Email hoặc mật khẩu không chính xác." });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new { message = "Tài khoản này đã bị tạm khóa. Vui lòng liên hệ quản trị viên." });
        }

        // Xác thực mật khẩu
        bool isPasswordValid = false;
        try
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi kiểm tra mật khẩu cho người dùng {Username}", user.Username);
        }

        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Tên đăng nhập / Email hoặc mật khẩu không chính xác." });
        }

        // Cập nhật thời gian đăng nhập lần cuối
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Tạo JWT token
        var token = _jwtService.GenerateToken(user, out var expiresAt);

        var response = new AuthResponseDto
        {
            Token = token,
            TokenType = "Bearer",
            ExpiresAt = expiresAt,
            User = new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            }
        };

        return Ok(response);
    }

    /// <summary>
    /// Lấy thông tin tài khoản hiện tại từ JWT Token (yêu cầu Authorization: Bearer {token})
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Token không hợp lệ hoặc đã hết hạn." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
        {
            return Unauthorized(new { message = "Người dùng không tồn tại hoặc đã bị khóa." });
        }

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        });
    }
}
