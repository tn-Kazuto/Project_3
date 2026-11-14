using System.Net;
using System.Net.Http.Json;
using backend.DTOs;
using PagedRecipeResult = JamesThew.Shared.Contracts.DTOs.Common.PagedResult<backend.DTOs.RecipeDto>;
using PagedTipResult = JamesThew.Shared.Contracts.DTOs.Common.PagedResult<backend.DTOs.TipDto>;
using Xunit;

namespace backend.tests
{
    /// <summary>
    /// Integration tests for PERF-09 and TC-RCP-08:
    /// - Mandatory pagination support
    /// - Maximum 50 items/page limit enforcement
    /// - PagedResult envelope validation
    /// </summary>
    public class PaginationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public PaginationTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task TC_RCP_08_GetPaged_Endpoint_Returns_Valid_PagedResult()
        {
            // Act
            var res = await _client.GetAsync("/api/recipes/paged?page=1&pageSize=5");

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<PagedRecipeResult>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotNull(body.Data);
            Assert.Equal(1, body.Data.PageIndex);
            Assert.Equal(5, body.Data.PageSize);
            Assert.True(body.Data.TotalCount >= 0);
            Assert.NotNull(body.Data.Items);
            Assert.True(body.Data.Items.Count() <= 5);
        }

        [Fact]
        public async Task TC_RCP_08_PageSize_Exceeding_50_Is_Clamped_To_50()
        {
            // Act: Request pageSize=500 per TC-RCP-08 spec
            var res = await _client.GetAsync("/api/recipes/paged?page=1&pageSize=500");

            // Assert: Safe page size MUST be clamped to 50
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<PagedRecipeResult>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotNull(body.Data);
            Assert.Equal(50, body.Data.PageSize);
            Assert.True(body.Data.Items.Count() <= 50);
        }

        [Fact]
        public async Task TC_TIP_GetPaged_Endpoint_Clamps_To_50()
        {
            // Act: Request tips with pageSize=200
            var res = await _client.GetAsync("/api/tips/paged?page=1&pageSize=200");

            // Assert
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            var body = await res.Content.ReadFromJsonAsync<ApiResponse<PagedTipResult>>();
            Assert.NotNull(body);
            Assert.True(body.Success);
            Assert.NotNull(body.Data);
            Assert.Equal(50, body.Data.PageSize);
            Assert.True(body.Data.Items.Count() <= 50);
        }
    }
}
