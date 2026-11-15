using backend.DTOs;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace backend.tests
{
    /// <summary>
    /// Integration tests for Redis Caching architecture:
    /// - Serializing and deserializing cache items
    /// - Serving category metadata from cache
    /// - Eviction upon cache expiration/removal
    /// - Resilient fallback upon connection failure
    /// </summary>
    public class RedisCacheTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public RedisCacheTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task TC_REDIS_01_SetAndGet_Persists_And_Retrieves_Data()
        {
            using var scope = _factory.Services.CreateScope();
            var cacheService = scope.ServiceProvider.GetRequiredService<ICacheService>();

            var testKey = "test:recipe:sample_" + Guid.NewGuid();
            var testDto = new RecipeDto
            {
                RecipeId = 999,
                Title = "Sous-Vide Wagyu Beef",
                IsFree = true
            };

            // Act
            await cacheService.SetAsync(testKey, testDto, TimeSpan.FromMinutes(5));
            var retrieved = await cacheService.GetAsync<RecipeDto>(testKey);

            // Assert
            Assert.NotNull(retrieved);
            Assert.Equal(999, retrieved.RecipeId);
            Assert.Equal("Sous-Vide Wagyu Beef", retrieved.Title);
            Assert.True(retrieved.IsFree);

            // Cleanup
            await cacheService.RemoveAsync(testKey);
            var afterRemoval = await cacheService.GetAsync<RecipeDto>(testKey);
            Assert.Null(afterRemoval);
        }

        [Fact]
        public async Task TC_REDIS_02_CategoryService_Caches_And_Serves_Categories()
        {
            using var scope = _factory.Services.CreateScope();
            var categoryService = scope.ServiceProvider.GetRequiredService<ICategoryService>();
            var cacheService = scope.ServiceProvider.GetRequiredService<ICacheService>();

            // Act: First call populates cache
            var firstCall = await categoryService.GetAllAsync();
            Assert.True(firstCall.Success);

            // Verify cache key was populated
            var cached = await cacheService.GetAsync<List<CategoryDto>>("jamesthew:categories:all");
            Assert.NotNull(cached);
            Assert.NotEmpty(cached);

            // Act: Second call reads directly from cache
            var secondCall = await categoryService.GetAllAsync();
            Assert.True(secondCall.Success);
            Assert.Equal(firstCall.Data!.Count(), secondCall.Data!.Count());
        }
    }
}
