using CoreBackend.DTOs;
using CoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SystemSettingsController : ControllerBase
{
    private readonly ISystemSettingService _settingService;

    public SystemSettingsController(ISystemSettingService settingService)
    {
        _settingService = settingService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _settingService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> GetByKey(string key)
    {
        var result = await _settingService.GetByKeyAsync(key);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPut("{key}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetSetting(string key, [FromBody] SetSystemSettingRequest request)
    {
        var result = await _settingService.SetSettingAsync(key, request);
        return Ok(result);
    }

    [HttpDelete("{key}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string key)
    {
        var result = await _settingService.DeleteSettingAsync(key);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LocationsController : ControllerBase
{
    private readonly ILocationService _locationService;

    public LocationsController(ILocationService locationService)
    {
        _locationService = locationService;
    }

    [HttpGet("provinces")]
    public async Task<IActionResult> GetProvinces()
    {
        var result = await _locationService.GetProvincesAsync();
        return Ok(result);
    }

    [HttpPost("provinces")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateProvince([FromBody] CreateProvinceRequest request)
    {
        var result = await _locationService.CreateProvinceAsync(request);
        return Ok(result);
    }

    [HttpDelete("provinces/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProvince(int id)
    {
        var result = await _locationService.DeleteProvinceAsync(id);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("provinces/{provinceId}/districts")]
    public async Task<IActionResult> GetDistricts(int provinceId)
    {
        var result = await _locationService.GetDistrictsByProvinceAsync(provinceId);
        return Ok(result);
    }

    [HttpPost("districts")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateDistrict([FromBody] CreateDistrictRequest request)
    {
        var result = await _locationService.CreateDistrictAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("districts/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteDistrict(int id)
    {
        var result = await _locationService.DeleteDistrictAsync(id);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
