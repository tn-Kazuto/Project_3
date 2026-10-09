using CoreBackend.DTOs;
using CoreBackend.Entities;
using CoreBackend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CoreBackend.Services;

// 1. Categories
public interface ICategoryService
{
    Task<ApiResponse<List<CategoryDto>>> GetAllAsync();
    Task<ApiResponse<CategoryDto>> GetByIdAsync(int id);
    Task<ApiResponse<CategoryDto>> CreateAsync(CreateCategoryRequest request);
    Task<ApiResponse<CategoryDto>> UpdateAsync(int id, UpdateCategoryRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _uow;
    public CategoryService(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<List<CategoryDto>>> GetAllAsync()
    {
        var all = await _uow.Categories.Query().AsNoTracking().ToListAsync();
        var root = all.Where(c => c.ParentId == null).OrderBy(c => c.SortOrder).Select(c => MapToDto(c, all)).ToList();
        return ApiResponse<List<CategoryDto>>.Ok(root);
    }

    private static CategoryDto MapToDto(Category c, List<Category> all)
    {
        return new CategoryDto
        {
            CategoryId = c.CategoryId,
            CategoryName = c.CategoryName,
            ParentId = c.ParentId,
            SortOrder = c.SortOrder,
            SubCategories = all.Where(x => x.ParentId == c.CategoryId).OrderBy(x => x.SortOrder).Select(x => MapToDto(x, all)).ToList()
        };
    }

    public async Task<ApiResponse<CategoryDto>> GetByIdAsync(int id)
    {
        var c = await _uow.Categories.GetByIdAsync(id);
        if (c == null) return ApiResponse<CategoryDto>.Fail("Category not found.");
        return ApiResponse<CategoryDto>.Ok(new CategoryDto
        {
            CategoryId = c.CategoryId,
            CategoryName = c.CategoryName,
            ParentId = c.ParentId,
            SortOrder = c.SortOrder
        });
    }

    public async Task<ApiResponse<CategoryDto>> CreateAsync(CreateCategoryRequest request)
    {
        var cat = new Category
        {
            CategoryName = request.CategoryName.Trim(),
            ParentId = request.ParentId,
            SortOrder = request.SortOrder
        };
        await _uow.Categories.AddAsync(cat);
        await _uow.CompleteAsync();
        return await GetByIdAsync(cat.CategoryId);
    }

    public async Task<ApiResponse<CategoryDto>> UpdateAsync(int id, UpdateCategoryRequest request)
    {
        var cat = await _uow.Categories.GetByIdAsync(id);
        if (cat == null) return ApiResponse<CategoryDto>.Fail("Category not found.");
        cat.CategoryName = request.CategoryName.Trim();
        cat.ParentId = request.ParentId;
        cat.SortOrder = request.SortOrder;
        await _uow.CompleteAsync();
        return await GetByIdAsync(id);
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var cat = await _uow.Categories.GetByIdAsync(id);
        if (cat == null) return ApiResponse<bool>.Fail("Category not found.");
        _uow.Categories.Remove(cat);
        await _uow.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Category deleted successfully.");
    }
}

// 2. Statuses
public interface IStatusService
{
    Task<ApiResponse<List<StatusDto>>> GetAllAsync(string? groupCode = null);
    Task<ApiResponse<StatusDto>> GetByIdAsync(int id);
    Task<ApiResponse<StatusDto>> CreateAsync(CreateStatusRequest request);
    Task<ApiResponse<StatusDto>> UpdateAsync(int id, UpdateStatusRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}

public class StatusService : IStatusService
{
    private readonly IUnitOfWork _uow;
    public StatusService(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<List<StatusDto>>> GetAllAsync(string? groupCode = null)
    {
        var q = _uow.Statuses.Query().AsNoTracking();
        if (!string.IsNullOrWhiteSpace(groupCode))
        {
            q = q.Where(s => s.GroupCode == groupCode.Trim());
        }

        var list = await q.Select(s => new StatusDto
        {
            StatusId = s.StatusId,
            GroupCode = s.GroupCode,
            StatusCode = s.StatusCode,
            StatusName = s.StatusName
        }).ToListAsync();

        return ApiResponse<List<StatusDto>>.Ok(list);
    }

    public async Task<ApiResponse<StatusDto>> GetByIdAsync(int id)
    {
        var s = await _uow.Statuses.GetByIdAsync(id);
        if (s == null) return ApiResponse<StatusDto>.Fail("Status not found.");
        return ApiResponse<StatusDto>.Ok(new StatusDto
        {
            StatusId = s.StatusId,
            GroupCode = s.GroupCode,
            StatusCode = s.StatusCode,
            StatusName = s.StatusName
        });
    }

    public async Task<ApiResponse<StatusDto>> CreateAsync(CreateStatusRequest request)
    {
        var exists = await _uow.Statuses.Query().AnyAsync(s => s.GroupCode == request.GroupCode && s.StatusCode == request.StatusCode);
        if (exists) return ApiResponse<StatusDto>.Fail("Status with this group and code already exists.");

        var st = new Status
        {
            GroupCode = request.GroupCode.Trim(),
            StatusCode = request.StatusCode.Trim(),
            StatusName = request.StatusName.Trim()
        };
        await _uow.Statuses.AddAsync(st);
        await _uow.CompleteAsync();
        return await GetByIdAsync(st.StatusId);
    }

    public async Task<ApiResponse<StatusDto>> UpdateAsync(int id, UpdateStatusRequest request)
    {
        var st = await _uow.Statuses.GetByIdAsync(id);
        if (st == null) return ApiResponse<StatusDto>.Fail("Status not found.");

        st.GroupCode = request.GroupCode.Trim();
        st.StatusCode = request.StatusCode.Trim();
        st.StatusName = request.StatusName.Trim();

        await _uow.CompleteAsync();
        return await GetByIdAsync(id);
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var st = await _uow.Statuses.GetByIdAsync(id);
        if (st == null) return ApiResponse<bool>.Fail("Status not found.");

        _uow.Statuses.Remove(st);
        await _uow.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Status deleted successfully.");
    }
}

// 3. SystemSettings
public interface ISystemSettingService
{
    Task<ApiResponse<List<SystemSettingDto>>> GetAllAsync();
    Task<ApiResponse<SystemSettingDto>> GetByKeyAsync(string key);
    Task<ApiResponse<SystemSettingDto>> SetSettingAsync(string key, SetSystemSettingRequest request);
    Task<ApiResponse<bool>> DeleteSettingAsync(string key);
}

public class SystemSettingService : ISystemSettingService
{
    private readonly IUnitOfWork _uow;
    public SystemSettingService(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<List<SystemSettingDto>>> GetAllAsync()
    {
        var list = await _uow.SystemSettings.Query().AsNoTracking().Select(s => new SystemSettingDto
        {
            SettingKey = s.SettingKey,
            SettingValue = s.SettingValue,
            Description = s.Description,
            UpdatedAt = s.UpdatedAt
        }).ToListAsync();

        return ApiResponse<List<SystemSettingDto>>.Ok(list);
    }

    public async Task<ApiResponse<SystemSettingDto>> GetByKeyAsync(string key)
    {
        var s = await _uow.SystemSettings.GetByIdAsync(key);
        if (s == null) return ApiResponse<SystemSettingDto>.Fail("Setting key not found.");
        return ApiResponse<SystemSettingDto>.Ok(new SystemSettingDto
        {
            SettingKey = s.SettingKey,
            SettingValue = s.SettingValue,
            Description = s.Description,
            UpdatedAt = s.UpdatedAt
        });
    }

    public async Task<ApiResponse<SystemSettingDto>> SetSettingAsync(string key, SetSystemSettingRequest request)
    {
        var s = await _uow.SystemSettings.GetByIdAsync(key);
        if (s == null)
        {
            s = new SystemSetting
            {
                SettingKey = key,
                SettingValue = request.SettingValue,
                Description = request.Description,
                UpdatedAt = DateTime.UtcNow
            };
            await _uow.SystemSettings.AddAsync(s);
        }
        else
        {
            s.SettingValue = request.SettingValue;
            if (request.Description != null) s.Description = request.Description;
            s.UpdatedAt = DateTime.UtcNow;
        }

        await _uow.CompleteAsync();
        return await GetByKeyAsync(key);
    }

    public async Task<ApiResponse<bool>> DeleteSettingAsync(string key)
    {
        var s = await _uow.SystemSettings.GetByIdAsync(key);
        if (s == null) return ApiResponse<bool>.Fail("Setting key not found.");
        _uow.SystemSettings.Remove(s);
        await _uow.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Setting deleted successfully.");
    }
}

// 4. Locations (Provinces & Districts)
public interface ILocationService
{
    Task<ApiResponse<List<ProvinceDto>>> GetProvincesAsync();
    Task<ApiResponse<ProvinceDto>> CreateProvinceAsync(CreateProvinceRequest request);
    Task<ApiResponse<List<DistrictDto>>> GetDistrictsByProvinceAsync(int provinceId);
    Task<ApiResponse<DistrictDto>> CreateDistrictAsync(CreateDistrictRequest request);
    Task<ApiResponse<bool>> DeleteProvinceAsync(int provinceId);
    Task<ApiResponse<bool>> DeleteDistrictAsync(int districtId);
}

public class LocationService : ILocationService
{
    private readonly IUnitOfWork _uow;
    public LocationService(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<List<ProvinceDto>>> GetProvincesAsync()
    {
        var provinces = await _uow.Provinces.Query()
            .Include(p => p.Districts)
            .AsNoTracking()
            .Select(p => new ProvinceDto
            {
                ProvinceId = p.ProvinceId,
                ProvinceName = p.ProvinceName,
                Districts = p.Districts.Select(d => new DistrictDto
                {
                    DistrictId = d.DistrictId,
                    DistrictName = d.DistrictName,
                    ProvinceId = d.ProvinceId
                }).ToList()
            }).ToListAsync();

        return ApiResponse<List<ProvinceDto>>.Ok(provinces);
    }

    public async Task<ApiResponse<ProvinceDto>> CreateProvinceAsync(CreateProvinceRequest request)
    {
        var p = new Province { ProvinceName = request.ProvinceName.Trim() };
        await _uow.Provinces.AddAsync(p);
        await _uow.CompleteAsync();
        return ApiResponse<ProvinceDto>.Ok(new ProvinceDto { ProvinceId = p.ProvinceId, ProvinceName = p.ProvinceName });
    }

    public async Task<ApiResponse<List<DistrictDto>>> GetDistrictsByProvinceAsync(int provinceId)
    {
        var districts = await _uow.Districts.Query()
            .Where(d => d.ProvinceId == provinceId)
            .AsNoTracking()
            .Select(d => new DistrictDto
            {
                DistrictId = d.DistrictId,
                DistrictName = d.DistrictName,
                ProvinceId = d.ProvinceId
            }).ToListAsync();

        return ApiResponse<List<DistrictDto>>.Ok(districts);
    }

    public async Task<ApiResponse<DistrictDto>> CreateDistrictAsync(CreateDistrictRequest request)
    {
        var prov = await _uow.Provinces.GetByIdAsync(request.ProvinceId);
        if (prov == null) return ApiResponse<DistrictDto>.Fail("Province not found.");

        var d = new District { DistrictName = request.DistrictName.Trim(), ProvinceId = request.ProvinceId };
        await _uow.Districts.AddAsync(d);
        await _uow.CompleteAsync();
        return ApiResponse<DistrictDto>.Ok(new DistrictDto { DistrictId = d.DistrictId, DistrictName = d.DistrictName, ProvinceId = d.ProvinceId });
    }

    public async Task<ApiResponse<bool>> DeleteProvinceAsync(int provinceId)
    {
        var p = await _uow.Provinces.GetByIdAsync(provinceId);
        if (p == null) return ApiResponse<bool>.Fail("Province not found.");
        _uow.Provinces.Remove(p);
        await _uow.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Province deleted successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteDistrictAsync(int districtId)
    {
        var d = await _uow.Districts.GetByIdAsync(districtId);
        if (d == null) return ApiResponse<bool>.Fail("District not found.");
        _uow.Districts.Remove(d);
        await _uow.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "District deleted successfully.");
    }
}

// 5. Notifications
public interface INotificationService
{
    Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(int userId, bool? unreadOnly = null);
    Task<ApiResponse<NotificationDto>> CreateNotificationAsync(CreateNotificationRequest request);
    Task<ApiResponse<bool>> MarkAsReadAsync(int notificationId, int userId);
    Task<ApiResponse<bool>> MarkAllAsReadAsync(int userId);
}

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _uow;
    public NotificationService(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(int userId, bool? unreadOnly = null)
    {
        var q = _uow.Notifications.Query().Where(n => n.UserId == userId);
        if (unreadOnly == true)
        {
            q = q.Where(n => !n.IsRead);
        }

        var list = await q.OrderByDescending(n => n.CreatedAt).Select(n => new NotificationDto
        {
            NotificationId = n.NotificationId,
            UserId = n.UserId,
            Title = n.Title,
            Content = n.Content,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        }).ToListAsync();

        return ApiResponse<List<NotificationDto>>.Ok(list);
    }

    public async Task<ApiResponse<NotificationDto>> CreateNotificationAsync(CreateNotificationRequest request)
    {
        var n = new Notification
        {
            UserId = request.UserId,
            Title = request.Title.Trim(),
            Content = request.Content.Trim(),
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        await _uow.Notifications.AddAsync(n);
        await _uow.CompleteAsync();

        return ApiResponse<NotificationDto>.Ok(new NotificationDto
        {
            NotificationId = n.NotificationId,
            UserId = n.UserId,
            Title = n.Title,
            Content = n.Content,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        });
    }

    public async Task<ApiResponse<bool>> MarkAsReadAsync(int notificationId, int userId)
    {
        var n = await _uow.Notifications.Query().FirstOrDefaultAsync(x => x.NotificationId == notificationId && x.UserId == userId);
        if (n == null) return ApiResponse<bool>.Fail("Notification not found.");
        n.IsRead = true;
        await _uow.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Marked as read.");
    }

    public async Task<ApiResponse<bool>> MarkAllAsReadAsync(int userId)
    {
        var list = await _uow.Notifications.Query().Where(x => x.UserId == userId && !x.IsRead).ToListAsync();
        foreach (var item in list) item.IsRead = true;
        await _uow.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "All marked as read.");
    }
}

// 6. Attachments
public interface IAttachmentService
{
    Task<ApiResponse<AttachmentDto>> UploadAsync(IFormFile file, string? entityName, string? entityId, string uploadFolderPath);
    Task<ApiResponse<AttachmentDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<AttachmentDto>>> GetByEntityAsync(string entityName, string entityId);
    Task<ApiResponse<bool>> DeleteAsync(int id, string webRootPath);
}

public class AttachmentService : IAttachmentService
{
    private readonly IUnitOfWork _uow;
    public AttachmentService(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<AttachmentDto>> UploadAsync(IFormFile file, string? entityName, string? entityId, string uploadFolderPath)
    {
        if (file.Length == 0) return ApiResponse<AttachmentDto>.Fail("No file uploaded.");

        if (!Directory.Exists(uploadFolderPath))
            Directory.CreateDirectory(uploadFolderPath);

        var ext = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadFolderPath, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativePath = $"/uploads/{uniqueFileName}";
        var att = new Attachment
        {
            FileName = file.FileName,
            FilePath = relativePath,
            ContentType = file.ContentType,
            FileSize = file.Length,
            EntityName = entityName,
            EntityId = entityId,
            UploadedAt = DateTime.UtcNow
        };

        await _uow.Attachments.AddAsync(att);
        await _uow.CompleteAsync();

        return ApiResponse<AttachmentDto>.Ok(new AttachmentDto
        {
            AttachmentId = att.AttachmentId,
            FileName = att.FileName,
            FilePath = att.FilePath,
            ContentType = att.ContentType,
            FileSize = att.FileSize,
            EntityName = att.EntityName,
            EntityId = att.EntityId,
            UploadedAt = att.UploadedAt
        });
    }

    public async Task<ApiResponse<AttachmentDto>> GetByIdAsync(int id)
    {
        var att = await _uow.Attachments.GetByIdAsync(id);
        if (att == null) return ApiResponse<AttachmentDto>.Fail("Attachment not found.");
        return ApiResponse<AttachmentDto>.Ok(new AttachmentDto
        {
            AttachmentId = att.AttachmentId,
            FileName = att.FileName,
            FilePath = att.FilePath,
            ContentType = att.ContentType,
            FileSize = att.FileSize,
            EntityName = att.EntityName,
            EntityId = att.EntityId,
            UploadedAt = att.UploadedAt
        });
    }

    public async Task<ApiResponse<List<AttachmentDto>>> GetByEntityAsync(string entityName, string entityId)
    {
        var list = await _uow.Attachments.Query()
            .Where(a => a.EntityName == entityName && a.EntityId == entityId)
            .Select(a => new AttachmentDto
            {
                AttachmentId = a.AttachmentId,
                FileName = a.FileName,
                FilePath = a.FilePath,
                ContentType = a.ContentType,
                FileSize = a.FileSize,
                EntityName = a.EntityName,
                EntityId = a.EntityId,
                UploadedAt = a.UploadedAt
            }).ToListAsync();

        return ApiResponse<List<AttachmentDto>>.Ok(list);
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id, string webRootPath)
    {
        var att = await _uow.Attachments.GetByIdAsync(id);
        if (att == null) return ApiResponse<bool>.Fail("Attachment not found.");

        var fullPath = Path.Combine(webRootPath, att.FilePath.TrimStart('/'));
        if (File.Exists(fullPath))
        {
            try { File.Delete(fullPath); } catch { /* ignore if locked */ }
        }

        _uow.Attachments.Remove(att);
        await _uow.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Attachment deleted successfully.");
    }
}

// 7. Audit & Operational Logs
public interface IAuditLogService
{
    Task LogAuditAsync(int? userId, string action, string tableName, string recordId, string? oldValue = null, string? newValue = null);
    Task<ApiResponse<PagedResult<AuditLogDto>>> GetAuditLogsAsync(int page = 1, int pageSize = 20);
    Task<ApiResponse<PagedResult<ErrorLogDto>>> GetErrorLogsAsync(int page = 1, int pageSize = 20);
    Task<ApiResponse<PagedResult<LoginHistoryDto>>> GetLoginHistoriesAsync(int? userId = null, int page = 1, int pageSize = 20);
    Task<ApiResponse<List<UserSessionDto>>> GetUserSessionsAsync(int userId);
    Task<ApiResponse<bool>> RevokeSessionAsync(int sessionId);
}

public class AuditLogService : IAuditLogService
{
    private readonly IUnitOfWork _uow;
    public AuditLogService(IUnitOfWork uow) => _uow = uow;

    public async Task LogAuditAsync(int? userId, string action, string tableName, string recordId, string? oldValue = null, string? newValue = null)
    {
        var log = new AuditLog
        {
            UserId = userId,
            Action = action,
            TableName = tableName,
            RecordId = recordId,
            OldValue = oldValue,
            NewValue = newValue,
            CreatedAt = DateTime.UtcNow
        };
        await _uow.AuditLogs.AddAsync(log);
        await _uow.CompleteAsync();
    }

    public async Task<ApiResponse<PagedResult<AuditLogDto>>> GetAuditLogsAsync(int page = 1, int pageSize = 20)
    {
        var q = _uow.AuditLogs.Query().Include(a => a.User).AsNoTracking();
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto
            {
                LogId = a.LogId,
                UserId = a.UserId,
                Username = a.User != null ? a.User.Username : null,
                Action = a.Action,
                TableName = a.TableName,
                RecordId = a.RecordId,
                OldValue = a.OldValue,
                NewValue = a.NewValue,
                CreatedAt = a.CreatedAt
            }).ToListAsync();

        return ApiResponse<PagedResult<AuditLogDto>>.Ok(new PagedResult<AuditLogDto>
        {
            Items = items,
            TotalCount = total,
            PageNumber = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<PagedResult<ErrorLogDto>>> GetErrorLogsAsync(int page = 1, int pageSize = 20)
    {
        var q = _uow.ErrorLogs.Query().AsNoTracking();
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new ErrorLogDto
            {
                ErrorId = e.ErrorId,
                Source = e.Source,
                Message = e.Message,
                StackTrace = e.StackTrace,
                UserId = e.UserId,
                CreatedAt = e.CreatedAt
            }).ToListAsync();

        return ApiResponse<PagedResult<ErrorLogDto>>.Ok(new PagedResult<ErrorLogDto>
        {
            Items = items,
            TotalCount = total,
            PageNumber = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<PagedResult<LoginHistoryDto>>> GetLoginHistoriesAsync(int? userId = null, int page = 1, int pageSize = 20)
    {
        var q = _uow.LoginHistories.Query().AsNoTracking();
        if (userId.HasValue) q = q.Where(l => l.UserId == userId.Value);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(l => l.LoginAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new LoginHistoryDto
            {
                LoginId = l.LoginId,
                UserId = l.UserId,
                Username = l.Username,
                IsSuccess = l.IsSuccess,
                IpAddress = l.IpAddress,
                LoginAt = l.LoginAt
            }).ToListAsync();

        return ApiResponse<PagedResult<LoginHistoryDto>>.Ok(new PagedResult<LoginHistoryDto>
        {
            Items = items,
            TotalCount = total,
            PageNumber = page,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<List<UserSessionDto>>> GetUserSessionsAsync(int userId)
    {
        var list = await _uow.UserSessions.Query()
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new UserSessionDto
            {
                SessionId = s.SessionId,
                UserId = s.UserId,
                IpAddress = s.IpAddress,
                UserAgent = s.UserAgent,
                CreatedAt = s.CreatedAt,
                ExpiresAt = s.ExpiresAt,
                IsRevoked = s.IsRevoked
            }).ToListAsync();

        return ApiResponse<List<UserSessionDto>>.Ok(list);
    }

    public async Task<ApiResponse<bool>> RevokeSessionAsync(int sessionId)
    {
        var session = await _uow.UserSessions.GetByIdAsync(sessionId);
        if (session == null) return ApiResponse<bool>.Fail("Session not found.");
        session.IsRevoked = true;
        await _uow.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Session revoked.");
    }
}
