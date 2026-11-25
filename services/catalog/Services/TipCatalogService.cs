using JamesThew.CatalogService.Data;
using JamesThew.CatalogService.DTOs;
using JamesThew.CatalogService.Models;
using JamesThew.Shared.Contracts.DTOs.Common;
using JamesThew.Shared.Contracts.Helpers;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.CatalogService.Services;

public sealed class TipCatalogService(
    CatalogDbContext dbContext,
    BillingEntitlementClient entitlementClient,
    RedisCatalogCache cache)
{
    private const int CacheTtlSeconds = 60;

    public async Task<ApiResponse<IEnumerable<TipDto>>> GetAllAsync(
        string? search,
        CatalogActor actor,
        CancellationToken cancellationToken,
        bool? isFreeOnly = null,
        bool includePreviews = false)
    {
        var hasFullAccess = await HasFullPremiumAccessAsync(actor, cancellationToken);
        var limitToFree = isFreeOnly == true || (!hasFullAccess && !includePreviews);
        var paidOnly = (hasFullAccess || includePreviews) && !limitToFree && isFreeOnly == false;
        var cacheKey = !hasFullAccess && !includePreviews && !isFreeOnly.HasValue
            ? await BuildListCacheKeyAsync(search, cancellationToken)
            : null;
        if (cacheKey is not null)
        {
            var cached = await cache.ReadJsonAsync<List<TipDto>>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                var visible = await RetainCurrentlyFreeAsync(cached, cancellationToken);
                return ApiResponse<IEnumerable<TipDto>>.Ok(visible);
            }
        }

        var tips = await BuildQuery(search, limitToFree, paidOnly)
            .OrderByDescending(tip => tip.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);
        var result = tips.Select(tip => MapForViewer(tip, hasFullAccess)).ToList();
        if (cacheKey is not null)
        {
            await cache.WriteJsonAsync(cacheKey, result, CacheTtlSeconds, cancellationToken);
        }

        return ApiResponse<IEnumerable<TipDto>>.Ok(result);
    }

    public async Task<ApiResponse<PagedResult<TipDto>>> GetPagedAsync(
        int page,
        int pageSize,
        string? search,
        CatalogActor actor,
        CancellationToken cancellationToken,
        bool? isFreeOnly = null,
        bool includePreviews = false)
    {
        var hasFullAccess = await HasFullPremiumAccessAsync(actor, cancellationToken);
        var limitToFree = isFreeOnly == true || (!hasFullAccess && !includePreviews);
        var paidOnly = (hasFullAccess || includePreviews) && !limitToFree && isFreeOnly == false;
        var safePage = Math.Max(1, page);
        var safePageSize = Math.Clamp(pageSize, 1, 50);
        var cacheKey = !hasFullAccess && !includePreviews && !isFreeOnly.HasValue
            ? await BuildPageCacheKeyAsync(search, safePage, safePageSize, cancellationToken)
            : null;

        if (cacheKey is not null)
        {
            var cached = await cache.ReadJsonAsync<PagedResult<TipDto>>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                var cachedItems = cached.Items.ToList();
                cached.Items = await RetainCurrentlyFreeAsync(cachedItems, cancellationToken);
                cached.TotalCount = Math.Max(0, cached.TotalCount - cachedItems.Count + cached.Items.Count());
                return ApiResponse<PagedResult<TipDto>>.Ok(cached);
            }
        }

        var query = BuildQuery(search, limitToFree, paidOnly);
        var totalCount = await query.CountAsync(cancellationToken);
        var tips = await query.OrderByDescending(tip => tip.CreatedAt).ThenByDescending(tip => tip.TipId)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .ToListAsync(cancellationToken);
        var result = new PagedResult<TipDto>
        {
            Items = tips.Select(tip => MapForViewer(tip, hasFullAccess)).ToList(),
            TotalCount = totalCount,
            PageIndex = safePage,
            PageSize = safePageSize
        };

        if (cacheKey is not null)
        {
            await cache.WriteJsonAsync(cacheKey, result, CacheTtlSeconds, cancellationToken);
        }

        return ApiResponse<PagedResult<TipDto>>.Ok(result);
    }

    public async Task<ApiResponse<TipDto>> GetByIdAsync(
        int id,
        CatalogActor actor,
        CancellationToken cancellationToken)
    {
        var tip = await dbContext.Tips.AsNoTracking()
            .FirstOrDefaultAsync(item => item.TipId == id, cancellationToken);
        if (tip is null) return ApiResponse<TipDto>.Fail("Tip not found.");

        if (!tip.IsFree)
        {
            if (actor.UserId is null)
            {
                return ApiResponse<TipDto>.Ok(
                    MapToPreviewDto(tip),
                    "PREVIEW: Viewing complimentary 50% preview of exclusive tip.");
            }

            var access = await GetPremiumAccessAsync(actor, cancellationToken);
            if (access == SubscriptionAccess.Inactive)
            {
                return ApiResponse<TipDto>.Fail(
                    "SUBSCRIPTION_EXPIRED: Please renew your pass to view secret tips.");
            }

            if (access == SubscriptionAccess.Unavailable)
            {
                return ApiResponse<TipDto>.Fail("SUBSCRIPTION_STATUS_UNAVAILABLE: Please retry shortly.");
            }
        }

        return ApiResponse<TipDto>.Ok(MapToDto(tip));
    }

    public async Task<ApiResponse<IEnumerable<TipDto>>> GetMyTipsAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        var tips = await dbContext.Tips.AsNoTracking()
            .Where(tip => tip.AuthorId == userId)
            .OrderByDescending(tip => tip.CreatedAt)
            .ToListAsync(cancellationToken);
        return ApiResponse<IEnumerable<TipDto>>.Ok(tips.Select(MapToDto).ToList());
    }

    public async Task<ApiResponse<TipDto>> CreateAsync(
        CreateTipRequest request,
        CatalogActor actor,
        CancellationToken cancellationToken)
    {
        var tip = new TipRecord
        {
            AuthorId = actor.UserId!.Value,
            AuthorName = ResolveAuthorName(actor),
            Title = request.Title.Trim(),
            Content = request.Content.Trim(),
            VideoUrl = request.VideoUrl?.Trim(),
            IsFree = actor.IsAdmin && request.IsFree,
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Tips.Add(tip);
        await dbContext.SaveChangesAsync(cancellationToken);
        await cache.InvalidateAsync(cancellationToken);
        return ApiResponse<TipDto>.Ok(MapToDto(tip), "Tip created successfully.");
    }

    public async Task<ApiResponse<TipDto>> UpdateAsync(
        int id,
        UpdateTipRequest request,
        CatalogActor actor,
        CancellationToken cancellationToken)
    {
        var tip = await dbContext.Tips.FirstOrDefaultAsync(item => item.TipId == id, cancellationToken);
        if (tip is null) return ApiResponse<TipDto>.Fail("Tip not found.");
        if (!actor.IsAdmin && tip.AuthorId != actor.UserId)
        {
            return ApiResponse<TipDto>.Fail(
                "FORBIDDEN: You do not have permission to update tips authored by another user.");
        }

        tip.Title = request.Title.Trim();
        tip.Content = request.Content.Trim();
        tip.VideoUrl = request.VideoUrl?.Trim();
        tip.UpdatedAt = DateTime.UtcNow;
        if (actor.IsAdmin) tip.IsFree = request.IsFree;

        await dbContext.SaveChangesAsync(cancellationToken);
        await cache.InvalidateAsync(cancellationToken);
        return ApiResponse<TipDto>.Ok(MapToDto(tip), "Tip updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(
        int id,
        CatalogActor actor,
        CancellationToken cancellationToken)
    {
        var tip = await dbContext.Tips.FirstOrDefaultAsync(item => item.TipId == id, cancellationToken);
        if (tip is null) return ApiResponse<bool>.Fail("Tip not found.");
        if (!actor.IsAdmin && tip.AuthorId != actor.UserId)
        {
            return ApiResponse<bool>.Fail(
                "FORBIDDEN: You do not have permission to delete tips authored by another user.");
        }

        dbContext.Tips.Remove(tip);
        await dbContext.SaveChangesAsync(cancellationToken);
        await cache.InvalidateAsync(cancellationToken);
        return ApiResponse<bool>.Ok(true, "Tip deleted successfully.");
    }

    private async Task<bool> HasFullPremiumAccessAsync(CatalogActor actor, CancellationToken cancellationToken) =>
        actor.IsAdmin || (actor.IsMember &&
            await GetPremiumAccessAsync(actor, cancellationToken) == SubscriptionAccess.Active);

    private Task<SubscriptionAccess> GetPremiumAccessAsync(CatalogActor actor, CancellationToken cancellationToken) =>
        actor.IsAdmin
            ? Task.FromResult(SubscriptionAccess.Active)
            : actor.IsMember
                ? entitlementClient.GetAccessAsync(actor.AuthorizationHeader, cancellationToken)
                : Task.FromResult(SubscriptionAccess.Inactive);

    private IQueryable<TipRecord> BuildQuery(string? search, bool limitToFree, bool paidOnly)
    {
        var query = dbContext.Tips.AsNoTracking().AsQueryable();
        if (limitToFree) query = query.Where(tip => tip.IsFree);
        else if (paidOnly) query = query.Where(tip => !tip.IsFree);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(tip => tip.Title.ToLower().Contains(term) || tip.Content.ToLower().Contains(term));
        }

        return query;
    }

    private async Task<string> BuildListCacheKeyAsync(string? search, CancellationToken cancellationToken)
    {
        var prefix = await cache.VersionedKeyAsync("catalog:tips:list", cancellationToken);
        return $"{prefix}:{CatalogCacheJson.HashKey(search)}";
    }

    private async Task<string> BuildPageCacheKeyAsync(
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var prefix = await cache.VersionedKeyAsync("catalog:tips:page", cancellationToken);
        return $"{prefix}:{CatalogCacheJson.HashKey(search, page.ToString(), pageSize.ToString())}";
    }

    private async Task<List<TipDto>> RetainCurrentlyFreeAsync(
        List<TipDto> cachedTips,
        CancellationToken cancellationToken)
    {
        var ids = cachedTips.Select(tip => tip.TipId).Distinct().ToArray();
        var visibleIds = await dbContext.Tips.AsNoTracking()
            .Where(tip => ids.Contains(tip.TipId) && tip.IsFree)
            .Select(tip => tip.TipId)
            .ToHashSetAsync(cancellationToken);
        return cachedTips.Where(tip => visibleIds.Contains(tip.TipId)).ToList();
    }

    private static TipDto MapForViewer(TipRecord tip, bool hasFullAccess) =>
        tip.IsFree || hasFullAccess ? MapToDto(tip) : MapToPreviewDto(tip);

    private static TipDto MapToPreviewDto(TipRecord tip) => new()
    {
        TipId = tip.TipId,
        AuthorId = tip.AuthorId,
        AuthorName = tip.AuthorName,
        Title = tip.Title,
        Content = ContentPreviewSanitizer.TruncateTextToHalf(tip.Content),
        IsFree = tip.IsFree,
        VideoUrl = null,
        CreatedAt = tip.CreatedAt,
        UpdatedAt = tip.UpdatedAt,
        AccessLevel = "PREVIEW",
        IsContentTruncated = true
    };

    private static TipDto MapToDto(TipRecord tip) => new()
    {
        TipId = tip.TipId,
        AuthorId = tip.AuthorId,
        AuthorName = tip.AuthorName,
        Title = tip.Title,
        Content = tip.Content,
        IsFree = tip.IsFree,
        VideoUrl = tip.VideoUrl,
        CreatedAt = tip.CreatedAt,
        UpdatedAt = tip.UpdatedAt,
        AccessLevel = "FULL",
        IsContentTruncated = false
    };

    private static string ResolveAuthorName(CatalogActor actor) =>
        string.IsNullOrWhiteSpace(actor.DisplayName) ? "Unknown" : actor.DisplayName.Trim();
}
