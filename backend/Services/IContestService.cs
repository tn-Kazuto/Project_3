using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Contest service managing culinary contests, guest & member submissions, and winner selection.
    /// </summary>
    public interface IContestService
    {
        Task<ApiResponse<IEnumerable<ContestDto>>> GetAllAsync(bool? activeOnly = null);
        Task<ApiResponse<ContestDto>> GetByIdAsync(int id);
        Task<ApiResponse<ContestDto>> CreateAsync(CreateContestRequest request, int adminId);
        Task<ApiResponse> DeleteAsync(int id);
        Task<ApiResponse<ContestEntryDto>> SubmitEntryAsync(int contestId, SubmitEntryRequest request, int? currentUserId);
        Task<ApiResponse<IEnumerable<ContestEntryDto>>> GetEntriesByContestAsync(int contestId, int? currentUserId = null, string? clientIp = null, bool? orderByVotes = null);
        Task<ApiResponse<ContestEntryDto>> SelectWinnerAsync(int entryId);
        Task<ApiResponse<ContestVoteResultDto>> VoteEntryAsync(int entryId, VoteContestEntryRequest request, int? currentUserId, string clientIp);
    }
}

