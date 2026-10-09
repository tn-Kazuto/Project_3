using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace CoreBackend.DTOs;

// Categories
public class CategoryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public int SortOrder { get; set; }
    public List<CategoryDto> SubCategories { get; set; } = new();
}

public class CreateCategoryRequest
{
    [Required]
    [StringLength(150)]
    public string CategoryName { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public int SortOrder { get; set; } = 0;
}

public class UpdateCategoryRequest
{
    [Required]
    [StringLength(150)]
    public string CategoryName { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public int SortOrder { get; set; }
}

// Statuses
public class StatusDto
{
    public int StatusId { get; set; }
    public string GroupCode { get; set; } = string.Empty;
    public string StatusCode { get; set; } = string.Empty;
    public string StatusName { get; set; } = string.Empty;
}

public class CreateStatusRequest
{
    [Required]
    [StringLength(50)]
    public string GroupCode { get; set; } = string.Empty;
    [Required]
    [StringLength(50)]
    public string StatusCode { get; set; } = string.Empty;
    [Required]
    [StringLength(100)]
    public string StatusName { get; set; } = string.Empty;
}

public class UpdateStatusRequest
{
    [Required]
    [StringLength(50)]
    public string GroupCode { get; set; } = string.Empty;
    [Required]
    [StringLength(50)]
    public string StatusCode { get; set; } = string.Empty;
    [Required]
    [StringLength(100)]
    public string StatusName { get; set; } = string.Empty;
}

// SystemSettings
public class SystemSettingDto
{
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SetSystemSettingRequest
{
    [Required]
    public string SettingValue { get; set; } = string.Empty;
    public string? Description { get; set; }
}

// Locations (Provinces & Districts)
public class ProvinceDto
{
    public int ProvinceId { get; set; }
    public string ProvinceName { get; set; } = string.Empty;
    public List<DistrictDto> Districts { get; set; } = new();
}

public class DistrictDto
{
    public int DistrictId { get; set; }
    public string DistrictName { get; set; } = string.Empty;
    public int ProvinceId { get; set; }
}

public class CreateProvinceRequest
{
    [Required]
    [StringLength(150)]
    public string ProvinceName { get; set; } = string.Empty;
}

public class CreateDistrictRequest
{
    [Required]
    [StringLength(150)]
    public string DistrictName { get; set; } = string.Empty;
    [Required]
    public int ProvinceId { get; set; }
}

// Notifications
public class NotificationDto
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateNotificationRequest
{
    [Required]
    public int UserId { get; set; }
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    [Required]
    public string Content { get; set; } = string.Empty;
}

// Attachments
public class UploadAttachmentRequest
{
    [Required]
    public IFormFile File { get; set; } = null!;
    public string? EntityName { get; set; }
    public string? EntityId { get; set; }
}

public class AttachmentDto
{
    public int AttachmentId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? EntityName { get; set; }
    public string? EntityId { get; set; }
    public DateTime UploadedAt { get; set; }
}

// AuditLogs, ErrorLogs, LoginHistories, Sessions
public class AuditLogDto
{
    public long LogId { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string Action { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    public string RecordId { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ErrorLogDto
{
    public long ErrorId { get; set; }
    public string? Source { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? StackTrace { get; set; }
    public int? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LoginHistoryDto
{
    public int LoginId { get; set; }
    public int? UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public string? IpAddress { get; set; }
    public DateTime LoginAt { get; set; }
}

public class UserSessionDto
{
    public int SessionId { get; set; }
    public int UserId { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
}
