using System.Text;
using JamesThew.CatalogService.Data;
using JamesThew.CatalogService.Messaging;
using JamesThew.CatalogService.Services;
using JamesThew.Shared.Contracts.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var catalogConnection = builder.Configuration.GetConnectionString("CatalogConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:CatalogConnection is required.");
var jwtKey = JwtKeyValidator.GetRequiredKey(builder.Configuration["Jwt:Key"]);
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "JamesThewApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "JamesThewClient";

builder.Services.AddDbContext<CatalogDbContext>(options => options.UseSqlServer(catalogConnection));
builder.Services.AddHttpClient<BillingEntitlementClient>((services, client) =>
{
    var baseUrl = services.GetRequiredService<IConfiguration>()
        .GetValue<string>("Billing:BaseUrl") ?? "http://localhost:5002";
    client.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/", UriKind.Absolute);
    client.Timeout = TimeSpan.FromSeconds(3);
});
builder.Services.AddSingleton<RedisCatalogCache>();
builder.Services.AddSingleton<CatalogEventPublisher>();
builder.Services.AddScoped<RecipeCatalogService>();
builder.Services.AddScoped<TipCatalogService>();
builder.Services.AddScoped<CatalogLookupService>();
builder.Services.AddScoped<CatalogLegacyImporter>();
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
    var dbContext = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await scope.ServiceProvider.GetRequiredService<CatalogLegacyImporter>()
        .ImportAsync(CancellationToken.None);
}

app.MapGet("/health", async (CatalogDbContext dbContext, CancellationToken cancellationToken) =>
    await dbContext.Database.CanConnectAsync(cancellationToken)
        ? Results.Ok(new { status = "healthy" })
        : Results.Problem("Catalog database is unavailable.", statusCode: StatusCodes.Status503ServiceUnavailable)).AllowAnonymous();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
