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
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
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

                logger.LogInformation("Khởi tạo tài khoản quản trị thành công: admin / admin123");
            }
            else
            {
                // Đảm bảo tài khoản admin luôn có mật khẩu mới: admin123
                var existingAdmin = context.Users.FirstOrDefault(u => u.Username == "admin");
                if (existingAdmin != null)
                {
                    existingAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
                    context.SaveChanges();
                    logger.LogInformation("Đã cập nhật mật khẩu tài khoản admin thành: admin123");
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Đã xảy ra lỗi khi khởi tạo cơ sở dữ liệu SQL Server.");
            throw;
        }
    }
}
