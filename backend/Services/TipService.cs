using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using JamesThew.Shared.Contracts.Constants;
using JamesThew.Shared.Contracts.Helpers;
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
            string? search, int? currentUserId, string? userRole, bool? isFreeOnly = null, bool includePreviews = false)
        {
            var (query, hasFullAccess) = await BuildFilteredQueryAsync(
                search, currentUserId, userRole, isFreeOnly, includePreviews);

            var tips = await query
                .OrderByDescending(t => t.CreatedAt)
                .Take(50) // PERF-09: Max 50 items per unpaged query
                .ToListAsync();

            return ApiResponse<IEnumerable<TipDto>>.Ok(tips.Select(t => MapForViewer(t, hasFullAccess)).ToList());
        }

        public async Task<ApiResponse<JamesThew.Shared.Contracts.DTOs.Common.PagedResult<TipDto>>> GetPagedAsync(
            int page, int pageSize, string? search, int? currentUserId, string? userRole, bool? isFreeOnly = null, bool includePreviews = false)
        {
            var (query, hasFullAccess) = await BuildFilteredQueryAsync(
                search, currentUserId, userRole, isFreeOnly, includePreviews);

            var totalCount = await query.CountAsync();
            var pageIndex = Math.Max(1, page);
            var safePageSize = Math.Clamp(pageSize, 1, 50); // PERF-09: Clamp to max 50 items/page

            var items = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageIndex - 1) * safePageSize)
                .Take(safePageSize)
                .ToListAsync();

            var pagedResult = new JamesThew.Shared.Contracts.DTOs.Common.PagedResult<TipDto>
            {
                Items = items.Select(t => MapForViewer(t, hasFullAccess)).ToList(),
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = safePageSize
            };

            return ApiResponse<JamesThew.Shared.Contracts.DTOs.Common.PagedResult<TipDto>>.Ok(pagedResult);
        }

        private async Task<(IQueryable<Tip> Query, bool HasFullAccess)> BuildFilteredQueryAsync(
            string? search,
            int? currentUserId,
            string? userRole,
            bool? isFreeOnly,
            bool includePreviews)
        {
            var query = _uow.Repository<Tip>().QueryReadOnly()
                .Include(t => t.Author)
                .AsQueryable();

            bool hasFullAccess = await HasFullPremiumAccessAsync(currentUserId, userRole);

            if (isFreeOnly.HasValue && isFreeOnly.Value)
            {
                query = query.Where(t => t.IsFree);
            }
            else if (!hasFullAccess && !includePreviews)
            {
                query = query.Where(t => t.IsFree);
            }
            else if (isFreeOnly.HasValue && !isFreeOnly.Value)
            {
                query = query.Where(t => !t.IsFree);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(t => t.Title.ToLower().Contains(term) ||
                                         t.Content.ToLower().Contains(term));
            }

            return (query, hasFullAccess);
        }

        private async Task<bool> HasFullPremiumAccessAsync(int? currentUserId, string? userRole)
        {
            if (currentUserId == null) return false;
            var normalizedRole = userRole?.Trim().ToUpperInvariant();
            if (normalizedRole == AppConstants.Roles.Admin) return true;
            if (normalizedRole == AppConstants.Roles.Member)
            {
                var currentUser = await _uow.Repository<User>().GetByIdAsync(currentUserId.Value);
                return currentUser?.SubscriptionEnd != null && currentUser.SubscriptionEnd >= DateTime.UtcNow;
            }
            return false;
        }

        public async Task<ApiResponse<TipDto>> GetByIdAsync(int id, int? currentUserId, string? userRole)
        {
            var tip = await _uow.Repository<Tip>().QueryReadOnly()
                .Include(t => t.Author)
                .FirstOrDefaultAsync(t => t.TipId == id);

            if (tip == null)
            {
                return ApiResponse<TipDto>.Fail("Tip not found.");
            }

            // Content gatekeeping: If tip is premium and user is guest, return sanitized 50% preview
            if (!tip.IsFree && currentUserId == null)
            {
                return ApiResponse<TipDto>.Ok(
                    MapToPreviewDto(tip),
                    "PREVIEW: Viewing complimentary 50% preview of exclusive tip.");
            }

            // Subscription expiration check for MEMBER role:
            if (!tip.IsFree && currentUserId != null)
            {
                var normalizedRole = userRole?.Trim().ToUpperInvariant();
                if (normalizedRole == AppConstants.Roles.Member)
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
            var tips = await _uow.Repository<Tip>().QueryReadOnly()
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
            bool isFree = userRole == AppConstants.Roles.Admin ? request.IsFree : false;

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
            if (userRole != AppConstants.Roles.Admin && tip.AuthorId != currentUserId)
            {
                return ApiResponse<TipDto>.Fail(
                    "FORBIDDEN: You do not have permission to update tips authored by another user.");
            }

            tip.Title = request.Title.Trim();
            tip.Content = request.Content.Trim();
            tip.VideoUrl = request.VideoUrl?.Trim();
            tip.UpdatedAt = DateTime.UtcNow;

            if (userRole == AppConstants.Roles.Admin)
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
            if (userRole != AppConstants.Roles.Admin && tip.AuthorId != currentUserId)
            {
                return ApiResponse.Fail(
                    "FORBIDDEN: You do not have permission to delete tips authored by another user.");
            }

            _uow.Repository<Tip>().Remove(tip);
            await _uow.SaveChangesAsync();

            return ApiResponse.Ok("Tip deleted successfully.");
        }

        private static TipDto MapForViewer(Tip t, bool hasFullAccess) =>
            t.IsFree || hasFullAccess ? MapToDto(t) : MapToPreviewDto(t);

        private static TipDto MapToPreviewDto(Tip t)
        {
            var dto = MapToDto(t);
            dto.Content = ContentPreviewSanitizer.TruncateTextToHalf(t.Content);
            dto.VideoUrl = null;
            dto.AccessLevel = "PREVIEW";
            dto.IsContentTruncated = true;
            return dto;
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
                UpdatedAt = t.UpdatedAt,
                AccessLevel = "FULL",
                IsContentTruncated = false
            };
        }
    }
}

