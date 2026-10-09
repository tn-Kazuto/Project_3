using CoreBackend.DTOs;
using CoreBackend.Entities;
using CoreBackend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CoreBackend.Services;

public interface IRoleService
{
    Task<ApiResponse<List<RoleDto>>> GetAllRolesAsync();
    Task<ApiResponse<RoleDto>> GetRoleByIdAsync(int id);
    Task<ApiResponse<RoleDto>> CreateRoleAsync(CreateRoleRequest request);
    Task<ApiResponse<RoleDto>> UpdateRoleAsync(int id, UpdateRoleRequest request);
    Task<ApiResponse<bool>> DeleteRoleAsync(int id);
    Task<ApiResponse<bool>> AssignPermissionsAsync(int roleId, AssignPermissionsRequest request);
    Task<ApiResponse<List<PermissionDto>>> GetAllPermissionsAsync();
}

public class RoleService : IRoleService
{
    private readonly IUnitOfWork _unitOfWork;

    public RoleService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<RoleDto>>> GetAllRolesAsync()
    {
        var roles = await _unitOfWork.Roles.Query()
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .AsNoTracking()
            .ToListAsync();

        var dtos = roles.Select(r => new RoleDto
        {
            RoleId = r.RoleId,
            RoleName = r.RoleName,
            Description = r.Description,
            Permissions = r.RolePermissions.Select(rp => new PermissionDto
            {
                PermissionId = rp.Permission.PermissionId,
                PermissionCode = rp.Permission.PermissionCode,
                PermissionName = rp.Permission.PermissionName
            }).ToList()
        }).ToList();

        return ApiResponse<List<RoleDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<RoleDto>> GetRoleByIdAsync(int id)
    {
        var role = await _unitOfWork.Roles.Query()
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.RoleId == id);

        if (role == null) return ApiResponse<RoleDto>.Fail("Role not found.");

        var dto = new RoleDto
        {
            RoleId = role.RoleId,
            RoleName = role.RoleName,
            Description = role.Description,
            Permissions = role.RolePermissions.Select(rp => new PermissionDto
            {
                PermissionId = rp.Permission.PermissionId,
                PermissionCode = rp.Permission.PermissionCode,
                PermissionName = rp.Permission.PermissionName
            }).ToList()
        };

        return ApiResponse<RoleDto>.Ok(dto);
    }

    public async Task<ApiResponse<RoleDto>> CreateRoleAsync(CreateRoleRequest request)
    {
        var exists = await _unitOfWork.Roles.Query().AnyAsync(r => r.RoleName.ToLower() == request.RoleName.ToLower());
        if (exists) return ApiResponse<RoleDto>.Fail("Role name already exists.");

        var role = new Role
        {
            RoleName = request.RoleName.Trim(),
            Description = request.Description
        };

        if (request.PermissionIds != null && request.PermissionIds.Any())
        {
            foreach (var pId in request.PermissionIds)
            {
                role.RolePermissions.Add(new RolePermission { PermissionId = pId });
            }
        }

        await _unitOfWork.Roles.AddAsync(role);
        await _unitOfWork.CompleteAsync();

        return await GetRoleByIdAsync(role.RoleId);
    }

    public async Task<ApiResponse<RoleDto>> UpdateRoleAsync(int id, UpdateRoleRequest request)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(id);
        if (role == null) return ApiResponse<RoleDto>.Fail("Role not found.");

        var exists = await _unitOfWork.Roles.Query().AnyAsync(r => r.RoleName.ToLower() == request.RoleName.ToLower() && r.RoleId != id);
        if (exists) return ApiResponse<RoleDto>.Fail("Role name already exists.");

        role.RoleName = request.RoleName.Trim();
        role.Description = request.Description;

        await _unitOfWork.CompleteAsync();
        return await GetRoleByIdAsync(id);
    }

    public async Task<ApiResponse<bool>> DeleteRoleAsync(int id)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(id);
        if (role == null) return ApiResponse<bool>.Fail("Role not found.");

        _unitOfWork.Roles.Remove(role);
        await _unitOfWork.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Role deleted successfully.");
    }

    public async Task<ApiResponse<bool>> AssignPermissionsAsync(int roleId, AssignPermissionsRequest request)
    {
        var role = await _unitOfWork.Roles.Query()
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.RoleId == roleId);

        if (role == null) return ApiResponse<bool>.Fail("Role not found.");

        role.RolePermissions.Clear();
        foreach (var pId in request.PermissionIds)
        {
            role.RolePermissions.Add(new RolePermission { RoleId = roleId, PermissionId = pId });
        }

        await _unitOfWork.CompleteAsync();
        return ApiResponse<bool>.Ok(true, "Permissions assigned to role successfully.");
    }

    public async Task<ApiResponse<List<PermissionDto>>> GetAllPermissionsAsync()
    {
        var permissions = await _unitOfWork.Permissions.Query().AsNoTracking().ToListAsync();
        var dtos = permissions.Select(p => new PermissionDto
        {
            PermissionId = p.PermissionId,
            PermissionCode = p.PermissionCode,
            PermissionName = p.PermissionName
        }).ToList();

        return ApiResponse<List<PermissionDto>>.Ok(dtos);
    }
}
