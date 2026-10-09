using System.Collections.Concurrent;
using CoreBackend.Data;
using CoreBackend.Entities;

namespace CoreBackend.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        Users = new GenericRepository<User>(_context);
        UserProfiles = new GenericRepository<UserProfile>(_context);
        Roles = new GenericRepository<Role>(_context);
        Permissions = new GenericRepository<Permission>(_context);
        RolePermissions = new GenericRepository<RolePermission>(_context);
        UserRoles = new GenericRepository<UserRole>(_context);
        UserSessions = new GenericRepository<UserSession>(_context);
        LoginHistories = new GenericRepository<LoginHistory>(_context);
        AuditLogs = new GenericRepository<AuditLog>(_context);
        ErrorLogs = new GenericRepository<ErrorLog>(_context);
        Notifications = new GenericRepository<Notification>(_context);
        SystemSettings = new GenericRepository<SystemSetting>(_context);
        Statuses = new GenericRepository<Status>(_context);
        Categories = new GenericRepository<Category>(_context);
        Provinces = new GenericRepository<Province>(_context);
        Districts = new GenericRepository<District>(_context);
        Attachments = new GenericRepository<Attachment>(_context);
    }

    public IGenericRepository<User> Users { get; }
    public IGenericRepository<UserProfile> UserProfiles { get; }
    public IGenericRepository<Role> Roles { get; }
    public IGenericRepository<Permission> Permissions { get; }
    public IGenericRepository<RolePermission> RolePermissions { get; }
    public IGenericRepository<UserRole> UserRoles { get; }
    public IGenericRepository<UserSession> UserSessions { get; }
    public IGenericRepository<LoginHistory> LoginHistories { get; }
    public IGenericRepository<AuditLog> AuditLogs { get; }
    public IGenericRepository<ErrorLog> ErrorLogs { get; }
    public IGenericRepository<Notification> Notifications { get; }
    public IGenericRepository<SystemSetting> SystemSettings { get; }
    public IGenericRepository<Status> Statuses { get; }
    public IGenericRepository<Category> Categories { get; }
    public IGenericRepository<Province> Provinces { get; }
    public IGenericRepository<District> Districts { get; }
    public IGenericRepository<Attachment> Attachments { get; }

    public IGenericRepository<T> Repository<T>() where T : class
    {
        return (IGenericRepository<T>)_repositories.GetOrAdd(typeof(T), _ => new GenericRepository<T>(_context));
    }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
