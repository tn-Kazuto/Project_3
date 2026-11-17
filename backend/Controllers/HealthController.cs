using System;
using System.Threading;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Health check controller serving Docker and load balancer readiness probes.
    /// Supports root /health, /api/health, and /api/healthcontroller paths.
    /// </summary>
    [ApiController]
    [AllowAnonymous]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HealthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("/health")]
        [HttpGet("/api/health")]
        [HttpGet("api/[controller]")]
        public async Task<IActionResult> CheckHealth(CancellationToken cancellationToken)
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
                if (canConnect)
                {
                    return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
                }

                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    status = "unhealthy",
                    error = "Database connection unavailable.",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    status = "unhealthy",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }
    }
}
