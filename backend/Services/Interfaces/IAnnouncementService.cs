using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Announcement service for publishing contest results and site-wide notifications.
    /// </summary>
    public interface IAnnouncementService
    {
        Task<ApiResponse<IEnumerable<AnnouncementDto>>> GetAllAsync();
        Task<ApiResponse<AnnouncementDto>> GetByIdAsync(int id);
        Task<ApiResponse<AnnouncementDto>> CreateAsync(CreateAnnouncementRequest request);
        Task<ApiResponse> DeleteAsync(int id);
    }
}

