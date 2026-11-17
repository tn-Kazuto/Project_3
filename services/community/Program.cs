using System.Text;
using JamesThew.CommunityService.Data;
using JamesThew.CommunityService.Services;
using JamesThew.Shared.Contracts.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var communityConnection = builder.Configuration.GetConnectionString("CommunityConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:CommunityConnection is required.");
var jwtKey = JwtKeyValidator.GetRequiredKey(builder.Configuration["Jwt:Key"]);
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "JamesThewApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "JamesThewClient";

builder.Services.AddDbContext<CommunityDbContext>(options => options.UseSqlServer(communityConnection));
builder.Services.AddScoped<CommunityApplicationService>();
builder.Services.AddScoped<CommunityLegacyImporter>();
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
    var dbContext = scope.ServiceProvider.GetRequiredService<CommunityDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await scope.ServiceProvider.GetRequiredService<CommunityLegacyImporter>()
        .ImportAsync(CancellationToken.None);
}

app.MapGet("/health", async (CommunityDbContext dbContext, CancellationToken cancellationToken) =>
    await dbContext.Database.CanConnectAsync(cancellationToken)
        ? Results.Ok(new { status = "healthy" })
        : Results.Problem("Community database is unavailable.", statusCode: StatusCodes.Status503ServiceUnavailable)).AllowAnonymous();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
