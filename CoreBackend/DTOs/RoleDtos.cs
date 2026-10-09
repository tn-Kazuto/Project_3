using System.ComponentModel.DataAnnotations;

namespace CoreBackend.DTOs;

public class RoleDto
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<PermissionDto> Permissions { get; set; } = new();
}

public class CreateRoleRequest
{
    [Required]
    [StringLength(50)]
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<int>? PermissionIds { get; set; }
}

public class UpdateRoleRequest
{
    [Required]
    [StringLength(50)]
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class PermissionDto
{
    public int PermissionId { get; set; }
    public string PermissionCode { get; set; } = string.Empty;
    public string PermissionName { get; set; } = string.Empty;
}

public class AssignPermissionsRequest
{
    public List<int> PermissionIds { get; set; } = new();
}
