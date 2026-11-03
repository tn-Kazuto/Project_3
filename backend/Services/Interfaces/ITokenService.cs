using backend.Entities;

namespace backend.Services
{
    /// <summary>
    /// Service for generating and validating JWT security tokens.
    /// </summary>
    public interface ITokenService
    {
        (string Token, DateTime ExpiresAt) GenerateJwtToken(User user);
    }
}

