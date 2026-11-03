using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Category service for culinary categories (Juices, Vegetarian, Non-Vegetarian, Italian, etc.).
    /// </summary>
    public interface ICategoryService
    {
        Task<ApiResponse<IEnumerable<CategoryDto>>> GetAllAsync();
        Task<ApiResponse<CategoryDto>> GetByIdAsync(int id);
    }
}

