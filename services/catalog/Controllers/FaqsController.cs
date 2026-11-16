using JamesThew.CatalogService.DTOs;
using JamesThew.CatalogService.Services;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.CatalogService.Controllers;

[ApiController]
[Route("api/faqs")]
[Route("api/v1/faqs")]
public sealed class FaqsController(CatalogLookupService catalog) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<FaqDto>>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await catalog.GetFaqsAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var response = await catalog.GetFaqAsync(id, cancellationToken);
        return response.Success ? Ok(response) : NotFound(response);
    }
}
