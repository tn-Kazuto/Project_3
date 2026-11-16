using JamesThew.Shared.Contracts.Security;
using Xunit;

namespace backend.tests;

public sealed class JwtKeyValidatorTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("too-short")]
    public void GetRequiredKey_rejects_missing_or_short_keys(string? key)
    {
        Assert.Throws<InvalidOperationException>(() => JwtKeyValidator.GetRequiredKey(key));
    }

    [Fact]
    public void GetRequiredKey_accepts_a_key_with_at_least_32_utf8_bytes()
    {
        const string key = "a-test-only-key-long-enough-for-hs256-signing";

        Assert.Equal(key, JwtKeyValidator.GetRequiredKey(key));
    }
}
