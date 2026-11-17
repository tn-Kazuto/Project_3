using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using backend.Services.EventBus;
using JamesThew.Shared.Contracts.Constants;
using JamesThew.Shared.Contracts.Events;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    /// <summary>
    /// Recipe business logic implementation with content gatekeeping and ownership authorization.
    /// Per SRS:
    /// - Guest users can only view and search recipes where IsFree == true.
    /// - Members and Admins can view all recipes.
    /// - Members can only update or delete recipes authored by themselves (AuthorId == currentUserId).
    /// - Admins can choose to mark their recipes as Free or Members Only.
    /// </summary>
    public class RecipeService : IRecipeService
    {
        private readonly IUnitOfWork _uow;
        private readonly IEventBus? _eventBus;
        private readonly ILogger<RecipeService>? _logger;

        public RecipeService(IUnitOfWork uow, IEventBus? eventBus = null, ILogger<RecipeService>? logger = null)
        {
            _uow = uow;
            _eventBus = eventBus;
            _logger = logger;
        }

        public async Task<ApiResponse<IEnumerable<RecipeDto>>> GetAllAsync(
            string? search, int? categoryId, int? currentUserId, string? userRole, bool? isFreeOnly = null, string? contentType = null)
        {
            var query = _uow.Repository<Recipe>().QueryReadOnly()
                .Include(r => r.Author)
                .Include(r => r.Category)
                .Include(r => r.Feedbacks)
                .AsQueryable();

            // 1. Content gatekeeping & Tier filtering
            bool isExpiredMember = false;
            if (currentUserId != null && userRole?.Trim().ToUpperInvariant() == AppConstants.Roles.Member)
            {
                var currentUser = await _uow.Repository<User>().GetByIdAsync(currentUserId.Value);
                if (currentUser?.SubscriptionEnd == null || currentUser.SubscriptionEnd < DateTime.UtcNow)
                {
                    isExpiredMember = true;
                }
            }

            if (currentUserId == null || isExpiredMember || (isFreeOnly.HasValue && isFreeOnly.Value))
            {
                query = query.Where(r => r.IsFree);
            }
            else if (isFreeOnly.HasValue && !isFreeOnly.Value)
            {
                query = query.Where(r => !r.IsFree);
            }

            // 2. Filter by category if specified
            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(r => r.CategoryId == categoryId.Value);
            }

            // 3. Filter by contentType if specified (ARTICLE, VIDEO, TALKSHOW, LIVESHOW)
            if (!string.IsNullOrWhiteSpace(contentType))
            {
                var typeTerm = contentType.Trim().ToUpper();
                query = query.Where(r => r.ContentType == typeTerm);
            }

            // 4. Search by keyword across title and ingredients
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(r => r.Title.ToLower().Contains(term) ||
                                         r.Ingredients.ToLower().Contains(term));
            }

            var recipes = await query
                .OrderByDescending(r => r.CreatedAt)
                .Take(50) // PERF-09: Max 50 items per unpaged query
                .Select(r => MapToDto(r))
                .ToListAsync();

            return ApiResponse<IEnumerable<RecipeDto>>.Ok(recipes);
        }

        public async Task<ApiResponse<JamesThew.Shared.Contracts.DTOs.Common.PagedResult<RecipeDto>>> GetPagedAsync(
            int page, int pageSize, string? search, int? categoryId, int? currentUserId, string? userRole, bool? isFreeOnly = null, string? contentType = null)
        {
            var query = _uow.Repository<Recipe>().QueryReadOnly()
                .Include(r => r.Author)
                .Include(r => r.Category)
                .Include(r => r.Feedbacks)
                .AsQueryable();

            // 1. Content gatekeeping & Tier filtering
            bool isExpiredMember = false;
            if (currentUserId != null && userRole?.Trim().ToUpperInvariant() == AppConstants.Roles.Member)
            {
                var currentUser = await _uow.Repository<User>().GetByIdAsync(currentUserId.Value);
                if (currentUser?.SubscriptionEnd == null || currentUser.SubscriptionEnd < DateTime.UtcNow)
                {
                    isExpiredMember = true;
                }
            }

            if (currentUserId == null || isExpiredMember || (isFreeOnly.HasValue && isFreeOnly.Value))
            {
                query = query.Where(r => r.IsFree);
            }
            else if (isFreeOnly.HasValue && !isFreeOnly.Value)
            {
                query = query.Where(r => !r.IsFree);
            }

            // 2. Filter by category if specified
            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(r => r.CategoryId == categoryId.Value);
            }

            // 3. Filter by contentType if specified (ARTICLE, VIDEO, TALKSHOW, LIVESHOW)
            if (!string.IsNullOrWhiteSpace(contentType))
            {
                var typeTerm = contentType.Trim().ToUpper();
                query = query.Where(r => r.ContentType == typeTerm);
            }

            // 4. Search by keyword across title and ingredients
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(r => r.Title.ToLower().Contains(term) ||
                                         r.Ingredients.ToLower().Contains(term));
            }

            var totalCount = await query.CountAsync();
            var pageIndex = Math.Max(1, page);
            var safePageSize = Math.Clamp(pageSize, 1, 50); // PERF-09: Clamp to max 50 items/page

            var items = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageIndex - 1) * safePageSize)
                .Take(safePageSize)
                .Select(r => MapToDto(r))
                .ToListAsync();

            var pagedResult = new JamesThew.Shared.Contracts.DTOs.Common.PagedResult<RecipeDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = safePageSize
            };

            return ApiResponse<JamesThew.Shared.Contracts.DTOs.Common.PagedResult<RecipeDto>>.Ok(pagedResult);
        }

        public async Task<ApiResponse<RecipeDto>> GetByIdAsync(int id, int? currentUserId, string? userRole)
        {
            var recipe = await _uow.Repository<Recipe>().QueryReadOnly()
                .Include(r => r.Author)
                .Include(r => r.Category)
                .Include(r => r.Feedbacks)
                .FirstOrDefaultAsync(r => r.RecipeId == id);

            if (recipe == null)
            {
                return ApiResponse<RecipeDto>.Fail("Recipe not found.");
            }

            // Content gatekeeping: If recipe is premium and user is not logged in, return a 50% preview
            if (!recipe.IsFree && currentUserId == null)
            {
                var previewDto = MapToDto(recipe);
                previewDto.AccessLevel = "PREVIEW";
                previewDto.VideoUrl = null; // Do not leak premium video URL to unauthenticated guests

                // Truncate cooking procedure to 50% of steps
                if (!string.IsNullOrWhiteSpace(previewDto.CookingProcedure))
                {
                    var steps = previewDto.CookingProcedure.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries);
                    var halfCount = Math.Max(1, (int)Math.Ceiling(steps.Length * 0.5));
                    previewDto.CookingProcedure = string.Join("\n", steps.Take(halfCount));
                }

                return ApiResponse<RecipeDto>.Ok(previewDto, "PREVIEW: Viewing complimentary 50% preview of exclusive recipe.");
            }

            // Membership subscription validity check:
            if (!recipe.IsFree && currentUserId != null)
            {
                var normalizedRole = userRole?.Trim().ToUpperInvariant();
                if (normalizedRole == AppConstants.Roles.Member)
                {
                    var user = await _uow.Repository<User>().GetByIdAsync(currentUserId.Value);
                    var subscriptionEnd = user?.SubscriptionEnd;
                    if (subscriptionEnd == null || subscriptionEnd < DateTime.UtcNow)
                    {
                        return ApiResponse<RecipeDto>.Fail(
                            "SUBSCRIPTION_EXPIRED: Please renew your pass to view secret recipes.");
                    }
                }
            }

            return ApiResponse<RecipeDto>.Ok(MapToDto(recipe));
        }

        public async Task<ApiResponse<IEnumerable<RecipeDto>>> GetMyRecipesAsync(int currentUserId)
        {
            var recipes = await _uow.Repository<Recipe>().QueryReadOnly()
                .Include(r => r.Author)
                .Include(r => r.Category)
                .Include(r => r.Feedbacks)
                .Where(r => r.AuthorId == currentUserId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => MapToDto(r))
                .ToListAsync();

            return ApiResponse<IEnumerable<RecipeDto>>.Ok(recipes);
        }

        public async Task<ApiResponse<RecipeDto>> CreateAsync(
            CreateRecipeRequest request, int currentUserId, string userRole)
        {
            var categoryExists = await _uow.Repository<Category>()
                .AnyAsync(c => c.CategoryId == request.CategoryId);
            if (!categoryExists)
            {
                return ApiResponse<RecipeDto>.Fail("Selected category does not exist.");
            }

            // Admin can freely toggle IsFree; Members' posts default to members-only (IsFree = false)
            bool isFree = userRole == AppConstants.Roles.Admin ? request.IsFree : false;

            var recipe = new Recipe
            {
                AuthorId = currentUserId,
                CategoryId = request.CategoryId,
                Title = request.Title.Trim(),
                Ingredients = request.Ingredients.Trim(),
                CookingProcedure = request.CookingProcedure.Trim(),
                ImageUrl = request.ImageUrl?.Trim(),
                IsFree = isFree,
                ContentType = string.IsNullOrWhiteSpace(request.ContentType) ? "ARTICLE" : request.ContentType.Trim().ToUpper(),
                VideoUrl = request.VideoUrl?.Trim(),
                ThumbnailUrl = request.ThumbnailUrl?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Repository<Recipe>().AddAsync(recipe);
            await _uow.SaveChangesAsync();

            if (_eventBus != null)
            {
                try
                {
                    var category = await _uow.Repository<Category>().GetByIdAsync(recipe.CategoryId);
                    await _eventBus.PublishAsync(
                        "jamesthew.events",
                        "recipe.published",
                        new RecipePublishedEvent(
                            recipe.RecipeId,
                            recipe.Title,
                            category?.CategoryName ?? "Culinary",
                            recipe.IsFree,
                            recipe.ContentType,
                            recipe.AuthorId,
                            recipe.CreatedAt));
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Failed to publish recipe event for recipe {RecipeId}", recipe.RecipeId);
                }
            }

            // Reload with relations for complete DTO
            return await GetByIdAsync(recipe.RecipeId, currentUserId, userRole);
        }

        public async Task<ApiResponse<RecipeDto>> UpdateAsync(
            int id, UpdateRecipeRequest request, int currentUserId, string userRole)
        {
            var recipe = await _uow.Repository<Recipe>().Query()
                .Include(r => r.Author)
                .Include(r => r.Category)
                .Include(r => r.Feedbacks)
                .FirstOrDefaultAsync(r => r.RecipeId == id);

            if (recipe == null)
            {
                return ApiResponse<RecipeDto>.Fail("Recipe not found.");
            }

            // Ownership check: Members can only edit their own recipes; Admin can moderate any recipe
            if (userRole != AppConstants.Roles.Admin && recipe.AuthorId != currentUserId)
            {
                return ApiResponse<RecipeDto>.Fail(
                    "FORBIDDEN: You do not have permission to update recipes authored by another user.");
            }

            var categoryExists = await _uow.Repository<Category>()
                .AnyAsync(c => c.CategoryId == request.CategoryId);
            if (!categoryExists)
            {
                return ApiResponse<RecipeDto>.Fail("Selected category does not exist.");
            }

            recipe.Title = request.Title.Trim();
            recipe.CategoryId = request.CategoryId;
            recipe.Ingredients = request.Ingredients.Trim();
            recipe.CookingProcedure = request.CookingProcedure.Trim();
            recipe.ImageUrl = request.ImageUrl?.Trim();
            recipe.ContentType = string.IsNullOrWhiteSpace(request.ContentType) ? recipe.ContentType : request.ContentType.Trim().ToUpper();
            recipe.VideoUrl = request.VideoUrl?.Trim();
            recipe.ThumbnailUrl = request.ThumbnailUrl?.Trim();
            recipe.UpdatedAt = DateTime.UtcNow;

            // Only Admin can adjust the IsFree flag
            if (userRole == AppConstants.Roles.Admin)
            {
                recipe.IsFree = request.IsFree;
            }

            _uow.Repository<Recipe>().Update(recipe);
            await _uow.SaveChangesAsync();

            return ApiResponse<RecipeDto>.Ok(MapToDto(recipe), "Recipe updated successfully.");
        }

        public async Task<ApiResponse> DeleteAsync(int id, int currentUserId, string userRole)
        {
            var recipe = await _uow.Repository<Recipe>().GetByIdAsync(id);
            if (recipe == null)
            {
                return ApiResponse.Fail("Recipe not found.");
            }

            // Ownership check: Members can only delete their own recipes; Admin can moderate/delete any recipe
            if (userRole != AppConstants.Roles.Admin && recipe.AuthorId != currentUserId)
            {
                return ApiResponse.Fail(
                    "FORBIDDEN: You do not have permission to delete recipes authored by another user.");
            }

            _uow.Repository<Recipe>().Remove(recipe);
            await _uow.SaveChangesAsync();

            return ApiResponse.Ok("Recipe deleted successfully.");
        }

        public async Task<ApiResponse<int>> IncrementShareCountAsync(int id)
        {
            var recipe = await _uow.Repository<Recipe>().GetByIdAsync(id);
            if (recipe == null)
            {
                return ApiResponse<int>.Fail("Recipe not found.");
            }

            recipe.ShareCount++;
            _uow.Repository<Recipe>().Update(recipe);
            await _uow.SaveChangesAsync();

            return ApiResponse<int>.Ok(recipe.ShareCount, "Share count incremented successfully.");
        }

        private static RecipeDto MapToDto(Recipe r)
        {
            return new RecipeDto
            {
                RecipeId = r.RecipeId,
                AuthorId = r.AuthorId,
                AuthorName = r.Author?.FullName ?? r.Author?.Username ?? "Unknown",
                CategoryId = r.CategoryId,
                CategoryName = r.Category?.CategoryName ?? string.Empty,
                Title = r.Title,
                Ingredients = r.Ingredients,
                CookingProcedure = r.CookingProcedure,
                ImageUrl = r.ImageUrl,
                IsFree = r.IsFree,
                ContentType = r.ContentType ?? "ARTICLE",
                VideoUrl = r.VideoUrl,
                ThumbnailUrl = r.ThumbnailUrl,
                ShareCount = r.ShareCount,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                FeedbackCount = r.Feedbacks?.Count ?? 0,
                AccessLevel = "FULL"
            };
        }
    }
}

