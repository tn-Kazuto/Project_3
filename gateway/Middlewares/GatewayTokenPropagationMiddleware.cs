using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JamesThew.Shared.Contracts.Constants;
using Microsoft.IdentityModel.Tokens;

namespace JamesThew.Gateway.Middlewares;

/// <summary>
/// Middleware xử lý tại API Gateway: Giải mã JWT token, kiểm tra tính hợp lệ,
/// và truyền nhận các Header định danh (Identity Propagation) xuống các Microservices nội bộ.
/// </summary>
public class GatewayTokenPropagationMiddleware(RequestDelegate next, IConfiguration configuration, ILogger<GatewayTokenPropagationMiddleware> logger)
{
    private readonly TokenValidationParameters _tokenValidationParams = new()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = configuration["Jwt:Issuer"] ?? "JamesThewApi",
        ValidAudience = configuration["Jwt:Audience"] ?? "JamesThewClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            configuration["Jwt:Key"] ?? "JamesThewCookingSecretKeyForJwtTokenAuth2026!#*VeryLongSecretKeyMustBe32BytesOrMore")),
        ClockSkew = TimeSpan.Zero
    };

    private readonly JwtSecurityTokenHandler _tokenHandler = new();

    public async Task InvokeAsync(HttpContext context)
    {
        string role = AppConstants.Roles.Guest;
        string? userId = null;
        string? email = null;
        string isSubscriptionActive = "false";

        var authHeader = context.Request.Headers.Authorization.ToString();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var tokenString = authHeader["Bearer ".Length..].Trim();
            try
            {
                var principal = _tokenHandler.ValidateToken(tokenString, _tokenValidationParams, out _);

                userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? principal.FindFirst("sub")?.Value;
                role = principal.FindFirst(ClaimTypes.Role)?.Value
                       ?? principal.FindFirst("role")?.Value
                       ?? AppConstants.Roles.Guest;
                email = principal.FindFirst(ClaimTypes.Email)?.Value
                        ?? principal.FindFirst("email")?.Value;

                var subClaim = principal.FindFirst("subscriptionActive")?.Value;
                if (!string.IsNullOrEmpty(subClaim))
                {
                    isSubscriptionActive = subClaim.ToLowerInvariant();
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning("Invalid or expired JWT token received at Gateway: {Message}", ex.Message);
                // Token invalid: Defaults to GUEST
                role = AppConstants.Roles.Guest;
            }
        }

        // Forward headers to downstream microservices
        context.Request.Headers[AppConstants.GatewayHeaders.UserRole] = role;
        context.Request.Headers[AppConstants.GatewayHeaders.SubscriptionActive] = isSubscriptionActive;
        if (!string.IsNullOrEmpty(userId))
        {
            context.Request.Headers[AppConstants.GatewayHeaders.UserId] = userId;
        }
        if (!string.IsNullOrEmpty(email))
        {
            context.Request.Headers[AppConstants.GatewayHeaders.UserEmail] = email;
        }

        await next(context);
    }
}

