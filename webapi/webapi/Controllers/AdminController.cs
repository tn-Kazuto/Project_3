using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Data;
using webapi.DTOs;

namespace webapi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Bắt buộc phải có JWT Token hợp lệ
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy thống kê tổng quan cho trang Dashboard Admin
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalAdmins = await _context.Users.CountAsync(u => u.Role == "Admin");
        var activeUsers = await _context.Users.CountAsync(u => u.IsActive);

        return Ok(new
        {
            totalUsers,
            totalAdmins,
            activeUsers,
            totalOrders = 128, // Dữ liệu mẫu khung
            totalRevenue = 45280000, // Dữ liệu mẫu khung (VND)
            serverTime = DateTime.UtcNow,
            status = "Online"
        });
    }

    /// <summary>
    /// Lấy danh sách người dùng cho khung trang Quản lý Người dùng
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.FullName,
                u.Role,
                u.IsActive,
                u.CreatedAt,
                u.LastLoginAt
            })
            .ToListAsync();

        return Ok(users);
    }
}
