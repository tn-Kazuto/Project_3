using System.Text;
using JamesThew.BillingService.Data;
using JamesThew.BillingService.Messaging;
using JamesThew.BillingService.Services;
using JamesThew.Shared.Contracts.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var billingConnection = builder.Configuration.GetConnectionString("BillingConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:BillingConnection is required.");
var legacyConnection = builder.Configuration.GetConnectionString("LegacyConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:LegacyConnection is required for initial billing data import.");
var jwtKey = JwtKeyValidator.GetRequiredKey(builder.Configuration["Jwt:Key"]);
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "JamesThewApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "JamesThewClient";

builder.Services.AddDbContext<BillingDbContext>(options => options.UseSqlServer(billingConnection));
builder.Services.AddDbContext<LegacyBillingDbContext>(options => options.UseSqlServer(legacyConnection));
builder.Services.AddScoped<BillingApplicationService>();
builder.Services.AddHostedService<BillingOutboxPublisher>();
builder.Services.AddControllers();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    });
builder.Services.AddAuthorization();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var billingDb = scope.ServiceProvider.GetRequiredService<BillingDbContext>();
    await billingDb.Database.EnsureCreatedAsync();
    var legacyDb = scope.ServiceProvider.GetRequiredService<LegacyBillingDbContext>();
    await scope.ServiceProvider.GetRequiredService<BillingApplicationService>()
        .ImportLegacyDataAsync(legacyDb, CancellationToken.None);
}

app.MapGet("/health", async (BillingDbContext dbContext, CancellationToken cancellationToken) =>
    await dbContext.Database.CanConnectAsync(cancellationToken)
        ? Results.Ok(new { status = "healthy" })
        : Results.Problem("Billing database is unavailable.", statusCode: StatusCodes.Status503ServiceUnavailable));
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
