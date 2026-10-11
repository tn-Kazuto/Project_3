using webapi.Models;

namespace webapi.Services;

public interface IJwtService
{
    string GenerateToken(User user, out DateTime expiresAt);
}
