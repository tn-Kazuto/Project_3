using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    /// <summary>
    /// Culinary category service with Redis distributed caching support.
    /// Frequently requested catalog metadata is cached with 10-minute TTL to relieve database pressure.
    /// </summary>
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _uow;
        private readonly ICacheService? _cacheService;

        private const string AllCategoriesCacheKey = "jamesthew:categories:all";

        public CategoryService(IUnitOfWork uow, ICacheService? cacheService = null)
        {
            _uow = uow;
            _cacheService = cacheService;
        }

        public async Task<ApiResponse<IEnumerable<CategoryDto>>> GetAllAsync()
        {
            if (_cacheService != null)
            {
                var cached = await _cacheService.GetAsync<List<CategoryDto>>(AllCategoriesCacheKey);
                if (cached != null)
                {
                    return ApiResponse<IEnumerable<CategoryDto>>.Ok(cached);
                }
            }

            var categories = await _uow.Repository<Category>()
                .QueryReadOnly()
                .Include(c => c.Recipes)
                .OrderBy(c => c.CategoryName)
                .Select(c => new CategoryDto
                {
                    CategoryId = c.CategoryId,
                    CategoryName = c.CategoryName,
                    Description = c.Description,
                    RecipeCount = c.Recipes.Count
                })
                .ToListAsync();

            if (_cacheService != null && categories.Count > 0)
            {
                await _cacheService.SetAsync(AllCategoriesCacheKey, categories, TimeSpan.FromMinutes(10));
            }

            return ApiResponse<IEnumerable<CategoryDto>>.Ok(categories);
        }

        public async Task<ApiResponse<CategoryDto>> GetByIdAsync(int id)
        {
            var cacheKey = $"jamesthew:category:{id}";
            if (_cacheService != null)
            {
                var cached = await _cacheService.GetAsync<CategoryDto>(cacheKey);
                if (cached != null)
                {
                    return ApiResponse<CategoryDto>.Ok(cached);
                }
            }

            var category = await _uow.Repository<Category>()
                .QueryReadOnly()
                .Include(c => c.Recipes)
                .FirstOrDefaultAsync(c => c.CategoryId == id);

            if (category == null)
            {
                return ApiResponse<CategoryDto>.Fail("Category not found.");
            }

            var dto = new CategoryDto
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                Description = category.Description,
                RecipeCount = category.Recipes.Count
            };

            if (_cacheService != null)
            {
                await _cacheService.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(10));
            }

            return ApiResponse<CategoryDto>.Ok(dto);
        }
    }
}
