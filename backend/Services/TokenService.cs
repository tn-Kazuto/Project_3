using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Entities;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    /// <summary>
    /// JWT token generation service adding standard role, email, and user ID claims.
    /// </summary>
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public (string Token, DateTime ExpiresAt) GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? "JamesThewCookingSecretKeyForJwtTokenAuth2026!#*VeryLongSecretKeyMustBe32BytesOrMore";
            var issuer = _config["Jwt:Issuer"] ?? "JamesThewApi";
            var audience = _config["Jwt:Audience"] ?? "JamesThewClient";
            var expireDays = int.TryParse(_config["Jwt:ExpireDays"], out var days) ? days : 7;

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new(ClaimTypes.Name, user.Username),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Role, user.Role),
                new("FullName", user.FullName)
            };

            if (!string.IsNullOrEmpty(user.SubscriptionPlan))
            {
                claims.Add(new Claim("SubscriptionPlan", user.SubscriptionPlan));
            }

            var expiresAt = DateTime.UtcNow.AddDays(expireDays);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials);

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
        }
    }
}

