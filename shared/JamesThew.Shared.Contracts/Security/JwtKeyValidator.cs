using System.Text;

namespace JamesThew.Shared.Contracts.Security;

public static class JwtKeyValidator
{
    public const int MinimumKeyBytes = 32;

    public static string GetRequiredKey(string? key)
    {
        if (string.IsNullOrWhiteSpace(key) || Encoding.UTF8.GetByteCount(key) < MinimumKeyBytes)
        {
            throw new InvalidOperationException("Jwt:Key must be configured with at least 32 bytes.");
        }

        return key;
    }
}
