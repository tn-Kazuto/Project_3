using System.Security.Claims;
using JamesThew.Shared.Contracts.Constants;

namespace backend.Middlewares
{
    /// <summary>
    /// Middleware hỗ trợ nhận diện danh tính và phân quyền truyền từ API Gateway (YARP)
    /// qua các headers: X-User-Id, X-User-Role, X-User-Email, X-Subscription-Active.
    /// Nếu request chưa được xác thực bằng JWT trực tiếp, middleware sẽ tái tạo ClaimsPrincipal
    /// từ các headers được Gateway tin cậy chuyển tiếp.
    /// </summary>
    public class IdentityPropagationMiddleware
    {
        private readonly RequestDelegate _next;

        public IdentityPropagationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity?.IsAuthenticated != true)
            {
                var role = context.Request.Headers[AppConstants.GatewayHeaders.UserRole].ToString();
                var userId = context.Request.Headers[AppConstants.GatewayHeaders.UserId].ToString();
                var email = context.Request.Headers[AppConstants.GatewayHeaders.UserEmail].ToString();
                var isSubActive = context.Request.Headers[AppConstants.GatewayHeaders.SubscriptionActive].ToString();

                if (!string.IsNullOrEmpty(role) && !string.Equals(role, AppConstants.Roles.Guest, StringComparison.OrdinalIgnoreCase))
                {
                    var claims = new List<Claim>
                    {
                        new(ClaimTypes.Role, role),
                        new("role", role)
                    };

                    if (!string.IsNullOrEmpty(userId))
                    {
                        claims.Add(new Claim(ClaimTypes.NameIdentifier, userId));
                        claims.Add(new Claim("sub", userId));
                    }

                    if (!string.IsNullOrEmpty(email))
                    {
                        claims.Add(new Claim(ClaimTypes.Email, email));
                        claims.Add(new Claim("email", email));
                    }

                    if (!string.IsNullOrEmpty(isSubActive))
                    {
                        claims.Add(new Claim("subscriptionActive", isSubActive));
                    }

                    var identity = new ClaimsIdentity(claims, "GatewayAuthentication");
                    context.User = new ClaimsPrincipal(identity);
                }
            }

            await _next(context);
        }
    }
}

