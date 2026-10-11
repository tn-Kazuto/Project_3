using Microsoft.EntityFrameworkCore;
using webapi.Models;

namespace webapi.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context, ILogger logger)
    {
        try
        {
            // Tự động tạo cơ sở dữ liệu và bảng nếu chưa tồn tại trên SQL Server
            context.Database.EnsureCreated();

            if (!context.Users.Any())
            {
                logger.LogInformation("Database trống, đang khởi tạo tài khoản quản trị mặc định...");

                var adminUser = new User
                {
                    Username = "admin",
                    Email = "admin@project.local",
                    FullName = "Quản Trị Viên Hệ Thống",
                    Role = "Admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var demoUser = new User
                {
                    Username = "userdemo",
                    Email = "demo@project.local",
                    FullName = "Người Dùng Mẫu",
                    Role = "User",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123456"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.AddRange(adminUser, demoUser);
                context.SaveChanges();

                logger.LogInformation("Khởi tạo tài khoản quản trị thành công: admin / Admin@123456");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Đã xảy ra lỗi khi khởi tạo cơ sở dữ liệu SQL Server.");
            throw;
        }
    }
}
