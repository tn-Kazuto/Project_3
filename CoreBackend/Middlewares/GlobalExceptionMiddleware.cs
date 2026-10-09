using System.Net;
using System.Security.Claims;
using System.Text.Json;
using CoreBackend.DTOs;
using CoreBackend.Entities;
using CoreBackend.Repositories;

namespace CoreBackend.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IServiceProvider serviceProvider)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex, serviceProvider);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception, IServiceProvider serviceProvider)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        // Try to save error to ErrorLogs table
        try
        {
            using var scope = serviceProvider.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            int? userId = null;
            var subClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(subClaim, out var parsedId))
            {
                userId = parsedId;
            }

            var errorLog = new ErrorLog
            {
                Source = context.Request.Path,
                Message = exception.Message,
                StackTrace = exception.StackTrace,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            await unitOfWork.ErrorLogs.AddAsync(errorLog);
            await unitOfWork.CompleteAsync();
        }
        catch
        {
            // Fallback if logging to database fails
        }

        var response = ApiResponse<string>.Fail("An internal server error occurred.", new List<string> { exception.Message });
        var json = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(json);
    }
}
