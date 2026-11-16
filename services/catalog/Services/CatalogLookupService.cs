using JamesThew.CatalogService.Data;
using JamesThew.CatalogService.DTOs;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.CatalogService.Services;

public sealed class CatalogLookupService(CatalogDbContext dbContext, RedisCatalogCache cache)
{
    private const int CacheTtlSeconds = 300;

    public async Task<ApiResponse<IEnumerable<CategoryDto>>> GetCategoriesAsync(CancellationToken cancellationToken)
    {
        var cacheKey = await cache.VersionedKeyAsync("catalog:categories", cancellationToken);
        var cached = await cache.ReadJsonAsync<List<CategoryDto>>(cacheKey, cancellationToken);
        if (cached is not null) return ApiResponse<IEnumerable<CategoryDto>>.Ok(cached);

        var categories = await dbContext.Categories.AsNoTracking()
            .OrderBy(category => category.CategoryName)
            .Select(category => new CategoryDto
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                Description = category.Description,
                RecipeCount = category.Recipes.Count
            })
            .ToListAsync(cancellationToken);
        await cache.WriteJsonAsync(cacheKey, categories, CacheTtlSeconds, cancellationToken);
        return ApiResponse<IEnumerable<CategoryDto>>.Ok(categories);
    }

    public async Task<ApiResponse<CategoryDto>> GetCategoryAsync(int id, CancellationToken cancellationToken)
    {
        var response = await GetCategoriesAsync(cancellationToken);
        var category = response.Data?.FirstOrDefault(item => item.CategoryId == id);
        return category is null
            ? ApiResponse<CategoryDto>.Fail("Category not found.")
            : ApiResponse<CategoryDto>.Ok(category);
    }

    public async Task<ApiResponse<IEnumerable<FaqDto>>> GetFaqsAsync(CancellationToken cancellationToken)
    {
        var cacheKey = await cache.VersionedKeyAsync("catalog:faqs", cancellationToken);
        var cached = await cache.ReadJsonAsync<List<FaqDto>>(cacheKey, cancellationToken);
        if (cached is not null) return ApiResponse<IEnumerable<FaqDto>>.Ok(cached);

        var faqs = await dbContext.Faqs.AsNoTracking()
            .OrderBy(faq => faq.DisplayOrder)
            .Select(faq => new FaqDto
            {
                FaqId = faq.FaqId,
                Question = faq.Question,
                Answer = faq.Answer,
                DisplayOrder = faq.DisplayOrder
            })
            .ToListAsync(cancellationToken);
        await cache.WriteJsonAsync(cacheKey, faqs, CacheTtlSeconds, cancellationToken);
        return ApiResponse<IEnumerable<FaqDto>>.Ok(faqs);
    }

    public async Task<ApiResponse<FaqDto>> GetFaqAsync(int id, CancellationToken cancellationToken)
    {
        var response = await GetFaqsAsync(cancellationToken);
        var faq = response.Data?.FirstOrDefault(item => item.FaqId == id);
        return faq is null
            ? ApiResponse<FaqDto>.Fail("FAQ item not found.")
            : ApiResponse<FaqDto>.Ok(faq);
    }
}
