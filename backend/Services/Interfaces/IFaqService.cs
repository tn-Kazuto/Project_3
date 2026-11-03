using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// FAQ service providing public access to the 7 mandatory frequently asked questions.
    /// </summary>
    public interface IFaqService
    {
        Task<ApiResponse<IEnumerable<FaqDto>>> GetAllAsync();
        Task<ApiResponse<FaqDto>> GetByIdAsync(int id);
    }
}

