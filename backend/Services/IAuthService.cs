using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Service handling authentication, registration with subscription payment, and login logic.
    /// </summary>
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequest request);
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequest request);
        Task<ApiResponse<UserDto>> GetCurrentUserAsync(int userId);
    }
}

