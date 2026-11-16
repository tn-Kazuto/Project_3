using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Entities;
using JamesThew.Shared.Contracts.Security;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    /// <summary>
    /// JWT and Refresh Token generation service.
    /// Access tokens are short-lived (15 minutes by default) to limit exposure.
    /// Refresh tokens are cryptographically random 64-byte strings valid for 7 days.
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
            var jwtKey = JwtKeyValidator.GetRequiredKey(_config["Jwt:Key"]);
            var issuer = _config["Jwt:Issuer"] ?? "JamesThewApi";
            var audience = _config["Jwt:Audience"] ?? "JamesThewClient";

            // Short-lived Access Token: defaults to 15 minutes for security
            var accessMinutes = int.TryParse(_config["Jwt:AccessTokenDurationMinutes"], out var minutes) ? minutes : 15;

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

            var expiresAt = DateTime.UtcNow.AddMinutes(accessMinutes);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials);

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
        }

        public RefreshToken GenerateRefreshToken(string? ipAddress = null)
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);

            var refreshDays = int.TryParse(_config["Jwt:RefreshTokenExpireDays"], out var days) ? days : 7;

            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomBytes),
                ExpiresAt = DateTime.UtcNow.AddDays(refreshDays),
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = ipAddress
            };
        }
    }
}
