using JamesThew.CatalogService.DTOs;
using JamesThew.CatalogService.Services;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.CatalogService.Controllers;

[ApiController]
[Route("api/categories")]
[Route("api/v1/categories")]
public sealed class CategoriesController(CatalogLookupService catalog) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await catalog.GetCategoriesAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var response = await catalog.GetCategoryAsync(id, cancellationToken);
        return response.Success ? Ok(response) : NotFound(response);
    }
}
