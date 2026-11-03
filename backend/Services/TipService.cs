using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    /// <summary>
    /// Cooking tips business logic implementation with content gatekeeping and ownership authorization.
    /// </summary>
    public class TipService : ITipService
    {
        private readonly IUnitOfWork _uow;

        public TipService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<ApiResponse<IEnumerable<TipDto>>> GetAllAsync(
            string? search, int? currentUserId, string? userRole)
        {
            var query = _uow.Repository<Tip>().Query()
                .Include(t => t.Author)
                .AsQueryable();

            // Content gatekeeping: Guests only see free tips
            if (currentUserId == null)
            {
                query = query.Where(t => t.IsFree);
            }

            // Keyword search across title and content
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(t => t.Title.ToLower().Contains(term) ||
                                         t.Content.ToLower().Contains(term));
            }

            var tips = await query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return ApiResponse<IEnumerable<TipDto>>.Ok(tips);
        }

        public async Task<ApiResponse<TipDto>> GetByIdAsync(int id, int? currentUserId, string? userRole)
        {
            var tip = await _uow.Repository<Tip>().Query()
                .Include(t => t.Author)
                .FirstOrDefaultAsync(t => t.TipId == id);

            if (tip == null)
            {
                return ApiResponse<TipDto>.Fail("Tip not found.");
            }

            // Content gatekeeping: If tip is premium and user is guest
            if (!tip.IsFree && currentUserId == null)
            {
                return ApiResponse<TipDto>.Fail(
                    "MEMBERS_ONLY: This tip is exclusive to registered members. Please login or subscribe to access.");
            }

            // Subscription expiration check for MEMBER role:
            if (!tip.IsFree && currentUserId != null)
            {
                var normalizedRole = userRole?.Trim().ToUpperInvariant();
                if (normalizedRole == "MEMBER")
                {
                    var user = await _uow.Repository<User>().GetByIdAsync(currentUserId.Value);
                    var subscriptionEnd = user?.SubscriptionEnd;
                    if (subscriptionEnd == null || subscriptionEnd < DateTime.UtcNow)
                    {
                        return ApiResponse<TipDto>.Fail(
                            "SUBSCRIPTION_EXPIRED: Please renew your pass to view secret tips.");
                    }
                }
            }

            return ApiResponse<TipDto>.Ok(MapToDto(tip));
        }

        public async Task<ApiResponse<IEnumerable<TipDto>>> GetMyTipsAsync(int currentUserId)
        {
            var tips = await _uow.Repository<Tip>().Query()
                .Include(t => t.Author)
                .Where(t => t.AuthorId == currentUserId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return ApiResponse<IEnumerable<TipDto>>.Ok(tips);
        }

        public async Task<ApiResponse<TipDto>> CreateAsync(
            CreateTipRequest request, int currentUserId, string userRole)
        {
            bool isFree = userRole == "ADMIN" ? request.IsFree : false;

            var tip = new Tip
            {
                AuthorId = currentUserId,
                Title = request.Title.Trim(),
                Content = request.Content.Trim(),
                VideoUrl = request.VideoUrl?.Trim(),
                IsFree = isFree,
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Repository<Tip>().AddAsync(tip);
            await _uow.SaveChangesAsync();

            return await GetByIdAsync(tip.TipId, currentUserId, userRole);
        }

        public async Task<ApiResponse<TipDto>> UpdateAsync(
            int id, UpdateTipRequest request, int currentUserId, string userRole)
        {
            var tip = await _uow.Repository<Tip>().Query()
                .Include(t => t.Author)
                .FirstOrDefaultAsync(t => t.TipId == id);

            if (tip == null)
            {
                return ApiResponse<TipDto>.Fail("Tip not found.");
            }

            // Ownership check: Members can only update their own tips; Admin can moderate any tip
            if (userRole != "ADMIN" && tip.AuthorId != currentUserId)
            {
                return ApiResponse<TipDto>.Fail(
                    "FORBIDDEN: You do not have permission to update tips authored by another user.");
            }

            tip.Title = request.Title.Trim();
            tip.Content = request.Content.Trim();
            tip.VideoUrl = request.VideoUrl?.Trim();
            tip.UpdatedAt = DateTime.UtcNow;

            if (userRole == "ADMIN")
            {
                tip.IsFree = request.IsFree;
            }

            _uow.Repository<Tip>().Update(tip);
            await _uow.SaveChangesAsync();

            return ApiResponse<TipDto>.Ok(MapToDto(tip), "Tip updated successfully.");
        }

        public async Task<ApiResponse> DeleteAsync(int id, int currentUserId, string userRole)
        {
            var tip = await _uow.Repository<Tip>().GetByIdAsync(id);
            if (tip == null)
            {
                return ApiResponse.Fail("Tip not found.");
            }

            // Ownership check: Members can only delete their own tips; Admin can moderate any tip
            if (userRole != "ADMIN" && tip.AuthorId != currentUserId)
            {
                return ApiResponse.Fail(
                    "FORBIDDEN: You do not have permission to delete tips authored by another user.");
            }

            _uow.Repository<Tip>().Remove(tip);
            await _uow.SaveChangesAsync();

            return ApiResponse.Ok("Tip deleted successfully.");
        }

        private static TipDto MapToDto(Tip t)
        {
            return new TipDto
            {
                TipId = t.TipId,
                AuthorId = t.AuthorId,
                AuthorName = t.Author?.FullName ?? t.Author?.Username ?? "Unknown",
                Title = t.Title,
                Content = t.Content,
                IsFree = t.IsFree,
                VideoUrl = t.VideoUrl,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            };
        }
    }
}

