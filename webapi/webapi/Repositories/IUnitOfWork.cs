using CoreBackend.Entities;

namespace CoreBackend.Repositories;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<User> Users { get; }
    IGenericRepository<UserProfile> UserProfiles { get; }
    IGenericRepository<Role> Roles { get; }
    IGenericRepository<Permission> Permissions { get; }
    IGenericRepository<RolePermission> RolePermissions { get; }
    IGenericRepository<UserRole> UserRoles { get; }
    IGenericRepository<UserSession> UserSessions { get; }
    IGenericRepository<LoginHistory> LoginHistories { get; }
    IGenericRepository<AuditLog> AuditLogs { get; }
    IGenericRepository<ErrorLog> ErrorLogs { get; }
    IGenericRepository<Notification> Notifications { get; }
    IGenericRepository<SystemSetting> SystemSettings { get; }
    IGenericRepository<Status> Statuses { get; }
    IGenericRepository<Category> Categories { get; }
    IGenericRepository<Province> Provinces { get; }
    IGenericRepository<District> Districts { get; }
    IGenericRepository<Attachment> Attachments { get; }

    IGenericRepository<T> Repository<T>() where T : class;
    Task<int> CompleteAsync();
}
