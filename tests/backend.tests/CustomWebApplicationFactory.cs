using backend.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.tests
{
    /// <summary>
    /// Custom WebApplicationFactory that configures a fresh InMemory database for integration tests.
    /// </summary>
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly string _dbName = "TestDb_" + Guid.NewGuid();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("Jwt:Key", "test-only-jwt-signing-key-for-jamesthew-backend-suite");
            builder.UseSetting("Seed:AdminPassword", "TestOnlyAdminSeedPassword!2026");
            builder.UseSetting("Seed:DemoMemberPassword", "TestOnlyMemberSeedPassword!2026");

            builder.ConfigureServices(services =>
            {
                // Register InMemory DbContext
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase(_dbName);
                });
            });
        }
    }
}
