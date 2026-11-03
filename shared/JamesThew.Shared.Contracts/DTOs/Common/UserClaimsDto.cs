namespace JamesThew.Shared.Contracts.DTOs.Common;

/// <summary>
/// DTO chứa thông tin định danh và phân quyền truyền từ Gateway xuống Microservices
/// </summary>
public class UserClaimsDto
{
    public int? UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "GUEST";
    public bool IsSubscriptionActive { get; set; }
    public DateTime? SubscriptionEnd { get; set; }
}

