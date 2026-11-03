using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _uow;

        public CategoryService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<ApiResponse<IEnumerable<CategoryDto>>> GetAllAsync()
        {
            var categories = await _uow.Repository<Category>()
                .Query()
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

            return ApiResponse<IEnumerable<CategoryDto>>.Ok(categories);
        }

        public async Task<ApiResponse<CategoryDto>> GetByIdAsync(int id)
        {
            var category = await _uow.Repository<Category>()
                .Query()
                .Include(c => c.Recipes)
                .FirstOrDefaultAsync(c => c.CategoryId == id);

            if (category == null)
            {
                return ApiResponse<CategoryDto>.Fail("Category not found.");
            }

            return ApiResponse<CategoryDto>.Ok(new CategoryDto
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                Description = category.Description,
                RecipeCount = category.Recipes.Count
            });
        }
    }
}

