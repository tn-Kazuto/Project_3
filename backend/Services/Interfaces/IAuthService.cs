using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Service handling authentication, registration with subscription payment, login,
    /// and refresh token lifecycle (token rotation & revocation).
    /// </summary>
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequest request, string? ipAddress = null);
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequest request, string? ipAddress = null);
        Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string token, string? ipAddress = null);
        Task<ApiResponse<bool>> RevokeTokenAsync(string token, string? ipAddress = null);
        Task<ApiResponse<UserDto>> GetCurrentUserAsync(int userId);
    }
}
