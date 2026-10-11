using CoreBackend.Entities;
using Microsoft.EntityFrameworkCore;

namespace CoreBackend.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Ensure database exists
        await context.Database.EnsureCreatedAsync();

        // 1. Roles
        if (!await context.Roles.AnyAsync())
        {
            var adminRole = new Role { RoleName = "Admin", Description = "System Administrator with full access" };
            var managerRole = new Role { RoleName = "Manager", Description = "Operations manager" };
            var userRole = new Role { RoleName = "User", Description = "Standard registered user" };

            await context.Roles.AddRangeAsync(adminRole, managerRole, userRole);
            await context.SaveChangesAsync();

            // 2. Permissions
            var permissions = new List<Permission>
            {
                new() { PermissionCode = "USER_VIEW", PermissionName = "View Users" },
                new() { PermissionCode = "USER_CREATE", PermissionName = "Create User" },
                new() { PermissionCode = "USER_EDIT", PermissionName = "Edit User" },
                new() { PermissionCode = "USER_DELETE", PermissionName = "Delete User" },
                new() { PermissionCode = "ROLE_MANAGE", PermissionName = "Manage Roles & Permissions" },
                new() { PermissionCode = "SETTING_MANAGE", PermissionName = "Manage System Settings" },
                new() { PermissionCode = "AUDIT_VIEW", PermissionName = "View Audit and System Logs" },
                new() { PermissionCode = "ATTACHMENT_MANAGE", PermissionName = "Manage Attachments" }
            };

            await context.Permissions.AddRangeAsync(permissions);
            await context.SaveChangesAsync();

            // Assign all permissions to Admin
            foreach (var p in permissions)
            {
                context.RolePermissions.Add(new RolePermission { RoleId = adminRole.RoleId, PermissionId = p.PermissionId });
            }

            // Assign USER_VIEW to User role
            var userViewPerm = permissions.First(p => p.PermissionCode == "USER_VIEW");
            context.RolePermissions.Add(new RolePermission { RoleId = userRole.RoleId, PermissionId = userViewPerm.PermissionId });

            await context.SaveChangesAsync();
        }

        // 3. Admin & Test User
        if (!await context.Users.AnyAsync(u => u.Username == "admin"))
        {
            var adminRole = await context.Roles.FirstAsync(r => r.RoleName == "Admin");
            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456"),
                Phone = "0987654321",
                IsActive = true,
                IsLocked = false,
                CreatedAt = DateTime.UtcNow,
                UserProfile = new UserProfile
                {
                    FullName = "System Administrator",
                    Gender = "Male",
                    BirthDate = new DateTime(1995, 1, 1),
                    Address = "Ha Noi, Viet Nam"
                }
            };
            adminUser.UserRoles.Add(new UserRole { Role = adminRole });

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();
        }

        // 4. Default SystemSettings
        if (!await context.SystemSettings.AnyAsync())
        {
            await context.SystemSettings.AddRangeAsync(
                new SystemSetting { SettingKey = "SystemTitle", SettingValue = "Enterprise Core Management System", Description = "App title" },
                new SystemSetting { SettingKey = "AllowRegistration", SettingValue = "true", Description = "Allow public user registration" },
                new SystemSetting { SettingKey = "SupportEmail", SettingValue = "support@enterprise.com", Description = "System support email" },
                new SystemSetting { SettingKey = "MaxUploadSizeMB", SettingValue = "25", Description = "Max attachment file size in MB" }
            );
            await context.SaveChangesAsync();
        }

        // 5. Default Statuses
        if (!await context.Statuses.AnyAsync())
        {
            await context.Statuses.AddRangeAsync(
                new Status { GroupCode = "USER_STATUS", StatusCode = "ACTIVE", StatusName = "Hoạt động" },
                new Status { GroupCode = "USER_STATUS", StatusCode = "INACTIVE", StatusName = "Ngưng hoạt động" },
                new Status { GroupCode = "USER_STATUS", StatusCode = "LOCKED", StatusName = "Tạm khóa" },
                new Status { GroupCode = "ORDER_STATUS", StatusCode = "PENDING", StatusName = "Chờ xử lý" },
                new Status { GroupCode = "ORDER_STATUS", StatusCode = "PROCESSING", StatusName = "Đang xử lý" },
                new Status { GroupCode = "ORDER_STATUS", StatusCode = "COMPLETED", StatusName = "Đã hoàn thành" },
                new Status { GroupCode = "ORDER_STATUS", StatusCode = "CANCELLED", StatusName = "Đã hủy" }
            );
            await context.SaveChangesAsync();
        }

        // 6. Default Categories
        if (!await context.Categories.AnyAsync())
        {
            var parent1 = new Category { CategoryName = "Công nghệ thông tin", SortOrder = 1 };
            var parent2 = new Category { CategoryName = "Kinh doanh & Quản trị", SortOrder = 2 };
            await context.Categories.AddRangeAsync(parent1, parent2);
            await context.SaveChangesAsync();

            await context.Categories.AddRangeAsync(
                new Category { CategoryName = "Lập trình C# .NET", ParentId = parent1.CategoryId, SortOrder = 1 },
                new Category { CategoryName = "Hạ tầng & DevOps", ParentId = parent1.CategoryId, SortOrder = 2 },
                new Category { CategoryName = "Marketing số", ParentId = parent2.CategoryId, SortOrder = 1 }
            );
            await context.SaveChangesAsync();
        }

        // 7. Default Provinces & Districts
        if (!await context.Provinces.AnyAsync())
        {
            var hn = new Province { ProvinceName = "Hà Nội" };
            var hcm = new Province { ProvinceName = "TP. Hồ Chí Minh" };
            var dn = new Province { ProvinceName = "Đà Nẵng" };
            await context.Provinces.AddRangeAsync(hn, hcm, dn);
            await context.SaveChangesAsync();

            await context.Districts.AddRangeAsync(
                new District { DistrictName = "Quận Ba Đình", ProvinceId = hn.ProvinceId },
                new District { DistrictName = "Quận Cầu Giấy", ProvinceId = hn.ProvinceId },
                new District { DistrictName = "Quận 1", ProvinceId = hcm.ProvinceId },
                new District { DistrictName = "Quận Bình Thạnh", ProvinceId = hcm.ProvinceId },
                new District { DistrictName = "Quận Hải Châu", ProvinceId = dn.ProvinceId }
            );
            await context.SaveChangesAsync();
        }
    }
}
