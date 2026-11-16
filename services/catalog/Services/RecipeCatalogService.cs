using JamesThew.CatalogService.Data;
using JamesThew.CatalogService.DTOs;
using JamesThew.CatalogService.Messaging;
using JamesThew.CatalogService.Models;
using JamesThew.Shared.Contracts.DTOs.Common;
using JamesThew.Shared.Contracts.Events;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.CatalogService.Services;

public sealed class RecipeCatalogService(
    CatalogDbContext dbContext,
    BillingEntitlementClient entitlementClient,
    RedisCatalogCache cache,
    CatalogEventPublisher eventPublisher)
{
    private const int CacheTtlSeconds = 60;

    public async Task<ApiResponse<IEnumerable<RecipeDto>>> GetAllAsync(
        string? search,
        int? categoryId,
        string? contentType,
        bool? isFreeOnly,
        CatalogActor actor,
        CancellationToken cancellationToken)
    {
        var limitToFree = await ShouldLimitToFreeAsync(actor, isFreeOnly, cancellationToken);
        var paidOnly = !limitToFree && isFreeOnly == false;
        var cacheKey = limitToFree
            ? await BuildListCacheKeyAsync(search, categoryId, contentType, cancellationToken)
            : null;

        if (cacheKey is not null)
        {
            var cached = await cache.ReadJsonAsync<List<RecipeDto>>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                var visible = await RetainCurrentlyFreeAsync(cached, cancellationToken);
                return ApiResponse<IEnumerable<RecipeDto>>.Ok(visible);
            }
        }

        var recipes = await BuildQuery(search, categoryId, contentType, limitToFree, paidOnly)
            .OrderByDescending(recipe => recipe.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);
        var result = recipes.Select(MapToDto).ToList();
        if (cacheKey is not null)
        {
            await cache.WriteJsonAsync(cacheKey, result, CacheTtlSeconds, cancellationToken);
        }

        return ApiResponse<IEnumerable<RecipeDto>>.Ok(result);
    }

    public async Task<ApiResponse<PagedResult<RecipeDto>>> GetPagedAsync(
        int page,
        int pageSize,
        string? search,
        int? categoryId,
        string? contentType,
        bool? isFreeOnly,
        CatalogActor actor,
        CancellationToken cancellationToken)
    {
        var limitToFree = await ShouldLimitToFreeAsync(actor, isFreeOnly, cancellationToken);
        var paidOnly = !limitToFree && isFreeOnly == false;
        var safePage = Math.Max(1, page);
        var safePageSize = Math.Clamp(pageSize, 1, 50);
        var cacheKey = limitToFree
            ? await BuildPageCacheKeyAsync(search, categoryId, contentType, safePage, safePageSize, cancellationToken)
            : null;

        if (cacheKey is not null)
        {
            var cached = await cache.ReadJsonAsync<PagedResult<RecipeDto>>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                cached.Items = await RetainCurrentlyFreeAsync(cached.Items.ToList(), cancellationToken);
                return ApiResponse<PagedResult<RecipeDto>>.Ok(cached);
            }
        }

        var query = BuildQuery(search, categoryId, contentType, limitToFree, paidOnly);
        var totalCount = await query.CountAsync(cancellationToken);
        var recipes = await query.OrderByDescending(recipe => recipe.CreatedAt).ThenByDescending(recipe => recipe.RecipeId)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .ToListAsync(cancellationToken);
        var result = new PagedResult<RecipeDto>
        {
            Items = recipes.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageIndex = safePage,
            PageSize = safePageSize
        };

        if (cacheKey is not null)
        {
            await cache.WriteJsonAsync(cacheKey, result, CacheTtlSeconds, cancellationToken);
        }

        return ApiResponse<PagedResult<RecipeDto>>.Ok(result);
    }

    public async Task<ApiResponse<RecipeDto>> GetByIdAsync(
        int id,
        CatalogActor actor,
        CancellationToken cancellationToken)
    {
        var recipe = await dbContext.Recipes.AsNoTracking().Include(item => item.Category)
            .FirstOrDefaultAsync(item => item.RecipeId == id, cancellationToken);
        if (recipe is null) return ApiResponse<RecipeDto>.Fail("Recipe not found.");

        if (!recipe.IsFree)
        {
            var access = await GetPremiumAccessAsync(actor, cancellationToken);
            if (access == SubscriptionAccess.Inactive)
            {
                return ApiResponse<RecipeDto>.Fail(
                    actor.UserId is null
                        ? "MEMBERS_ONLY: This recipe is exclusive to registered members. Please login or subscribe to access."
                        : "SUBSCRIPTION_EXPIRED: Please renew your pass to view secret recipes.");
            }

            if (access == SubscriptionAccess.Unavailable)
            {
                return ApiResponse<RecipeDto>.Fail("SUBSCRIPTION_STATUS_UNAVAILABLE: Please retry shortly.");
            }
        }

        return ApiResponse<RecipeDto>.Ok(MapToDto(recipe));
    }

    public async Task<ApiResponse<IEnumerable<RecipeDto>>> GetMyRecipesAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        var recipes = await dbContext.Recipes.AsNoTracking().Include(recipe => recipe.Category)
            .Where(recipe => recipe.AuthorId == userId)
            .OrderByDescending(recipe => recipe.CreatedAt)
            .ToListAsync(cancellationToken);
        return ApiResponse<IEnumerable<RecipeDto>>.Ok(recipes.Select(MapToDto).ToList());
    }

    public async Task<ApiResponse<RecipeDto>> CreateAsync(
        CreateRecipeRequest request,
        CatalogActor actor,
        CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories
            .FirstOrDefaultAsync(item => item.CategoryId == request.CategoryId, cancellationToken);
        if (category is null)
        {
            return ApiResponse<RecipeDto>.Fail("Selected category does not exist.");
        }

        var recipe = new RecipeRecord
        {
            AuthorId = actor.UserId!.Value,
            AuthorName = ResolveAuthorName(actor),
            CategoryId = category.CategoryId,
            Title = request.Title.Trim(),
            Ingredients = request.Ingredients.Trim(),
            CookingProcedure = request.CookingProcedure.Trim(),
            ImageUrl = request.ImageUrl?.Trim(),
            IsFree = actor.IsAdmin && request.IsFree,
            ContentType = NormalizeContentType(request.ContentType),
            VideoUrl = request.VideoUrl?.Trim(),
            ThumbnailUrl = request.ThumbnailUrl?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Recipes.Add(recipe);
        await dbContext.SaveChangesAsync(cancellationToken);
        recipe.Category = category;
        await cache.InvalidateAsync(cancellationToken);
        await eventPublisher.PublishRecipePublishedAsync(new RecipePublishedEvent(
            recipe.RecipeId, recipe.Title, category.CategoryName, recipe.IsFree, recipe.ContentType,
            recipe.AuthorId, recipe.CreatedAt), cancellationToken);
        return ApiResponse<RecipeDto>.Ok(MapToDto(recipe), "Recipe created successfully.");
    }

    public async Task<ApiResponse<RecipeDto>> UpdateAsync(
        int id,
        UpdateRecipeRequest request,
        CatalogActor actor,
        CancellationToken cancellationToken)
    {
        var recipe = await dbContext.Recipes.Include(item => item.Category)
            .FirstOrDefaultAsync(item => item.RecipeId == id, cancellationToken);
        if (recipe is null) return ApiResponse<RecipeDto>.Fail("Recipe not found.");
        if (!actor.IsAdmin && recipe.AuthorId != actor.UserId)
        {
            return ApiResponse<RecipeDto>.Fail(
                "FORBIDDEN: You do not have permission to update recipes authored by another user.");
        }

        var category = await dbContext.Categories
            .FirstOrDefaultAsync(item => item.CategoryId == request.CategoryId, cancellationToken);
        if (category is null) return ApiResponse<RecipeDto>.Fail("Selected category does not exist.");

        recipe.Title = request.Title.Trim();
        recipe.CategoryId = category.CategoryId;
        recipe.Category = category;
        recipe.Ingredients = request.Ingredients.Trim();
        recipe.CookingProcedure = request.CookingProcedure.Trim();
        recipe.ImageUrl = request.ImageUrl?.Trim();
        recipe.ContentType = string.IsNullOrWhiteSpace(request.ContentType)
            ? recipe.ContentType
            : NormalizeContentType(request.ContentType);
        recipe.VideoUrl = request.VideoUrl?.Trim();
        recipe.ThumbnailUrl = request.ThumbnailUrl?.Trim();
        recipe.UpdatedAt = DateTime.UtcNow;
        if (actor.IsAdmin) recipe.IsFree = request.IsFree;

        await dbContext.SaveChangesAsync(cancellationToken);
        await cache.InvalidateAsync(cancellationToken);
        return ApiResponse<RecipeDto>.Ok(MapToDto(recipe), "Recipe updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(
        int id,
        CatalogActor actor,
        CancellationToken cancellationToken)
    {
        var recipe = await dbContext.Recipes.FirstOrDefaultAsync(item => item.RecipeId == id, cancellationToken);
        if (recipe is null) return ApiResponse<bool>.Fail("Recipe not found.");
        if (!actor.IsAdmin && recipe.AuthorId != actor.UserId)
        {
            return ApiResponse<bool>.Fail(
                "FORBIDDEN: You do not have permission to delete recipes authored by another user.");
        }

        dbContext.Recipes.Remove(recipe);
        await dbContext.SaveChangesAsync(cancellationToken);
        await cache.InvalidateAsync(cancellationToken);
        return ApiResponse<bool>.Ok(true, "Recipe deleted successfully.");
    }

    private async Task<bool> ShouldLimitToFreeAsync(
        CatalogActor actor,
        bool? isFreeOnly,
        CancellationToken cancellationToken)
    {
        if (isFreeOnly == true) return true;
        if (actor.IsAdmin) return false;
        if (actor.IsMember)
        {
            return await GetPremiumAccessAsync(actor, cancellationToken) != SubscriptionAccess.Active;
        }

        return true;
    }

    private Task<SubscriptionAccess> GetPremiumAccessAsync(CatalogActor actor, CancellationToken cancellationToken) =>
        actor.IsAdmin
            ? Task.FromResult(SubscriptionAccess.Active)
            : actor.IsMember
                ? entitlementClient.GetAccessAsync(actor.AuthorizationHeader, cancellationToken)
                : Task.FromResult(SubscriptionAccess.Inactive);

    private IQueryable<RecipeRecord> BuildQuery(
        string? search,
        int? categoryId,
        string? contentType,
        bool limitToFree,
        bool paidOnly)
    {
        var query = dbContext.Recipes.AsNoTracking().Include(recipe => recipe.Category).AsQueryable();
        if (limitToFree) query = query.Where(recipe => recipe.IsFree);
        else if (paidOnly) query = query.Where(recipe => !recipe.IsFree);
        if (categoryId is > 0) query = query.Where(recipe => recipe.CategoryId == categoryId.Value);
        if (!string.IsNullOrWhiteSpace(contentType))
        {
            var normalizedType = contentType.Trim().ToUpperInvariant();
            query = query.Where(recipe => recipe.ContentType == normalizedType);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(recipe => recipe.Title.ToLower().Contains(term) ||
                recipe.Ingredients.ToLower().Contains(term));
        }

        return query;
    }

    private async Task<string> BuildListCacheKeyAsync(
        string? search,
        int? categoryId,
        string? contentType,
        CancellationToken cancellationToken)
    {
        var versionedPrefix = await cache.VersionedKeyAsync("catalog:recipes:list", cancellationToken);
        var hash = CatalogCacheJson.HashKey(search, categoryId?.ToString(), contentType);
        return $"{versionedPrefix}:{hash}";
    }

    private async Task<string> BuildPageCacheKeyAsync(
        string? search,
        int? categoryId,
        string? contentType,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var versionedPrefix = await cache.VersionedKeyAsync("catalog:recipes:page", cancellationToken);
        var hash = CatalogCacheJson.HashKey(search, categoryId?.ToString(), contentType,
            page.ToString(), pageSize.ToString());
        return $"{versionedPrefix}:{hash}";
    }

    private async Task<List<RecipeDto>> RetainCurrentlyFreeAsync(
        List<RecipeDto> cachedRecipes,
        CancellationToken cancellationToken)
    {
        var ids = cachedRecipes.Select(recipe => recipe.RecipeId).Distinct().ToArray();
        var visibleIds = await dbContext.Recipes.AsNoTracking()
            .Where(recipe => ids.Contains(recipe.RecipeId) && recipe.IsFree)
            .Select(recipe => recipe.RecipeId)
            .ToHashSetAsync(cancellationToken);
        return cachedRecipes.Where(recipe => visibleIds.Contains(recipe.RecipeId)).ToList();
    }

    private static RecipeDto MapToDto(RecipeRecord recipe) => new()
    {
        RecipeId = recipe.RecipeId,
        AuthorId = recipe.AuthorId,
        AuthorName = recipe.AuthorName,
        CategoryId = recipe.CategoryId,
        CategoryName = recipe.Category.CategoryName,
        Title = recipe.Title,
        Ingredients = recipe.Ingredients,
        CookingProcedure = recipe.CookingProcedure,
        ImageUrl = recipe.ImageUrl,
        IsFree = recipe.IsFree,
        ContentType = recipe.ContentType,
        VideoUrl = recipe.VideoUrl,
        ThumbnailUrl = recipe.ThumbnailUrl,
        ShareCount = recipe.ShareCount,
        FeedbackCount = recipe.FeedbackCount,
        CreatedAt = recipe.CreatedAt,
        UpdatedAt = recipe.UpdatedAt
    };

    private static string ResolveAuthorName(CatalogActor actor) =>
        string.IsNullOrWhiteSpace(actor.DisplayName) ? "Unknown" : actor.DisplayName.Trim();

    private static string NormalizeContentType(string? contentType) =>
        string.IsNullOrWhiteSpace(contentType) ? "ARTICLE" : contentType.Trim().ToUpperInvariant();
}
