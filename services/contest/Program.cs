using System.Text;
using JamesThew.ContestService.Data;
using JamesThew.ContestService.Messaging;
using JamesThew.ContestService.Services;
using JamesThew.Shared.Contracts.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var contestConnection = builder.Configuration.GetConnectionString("ContestConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:ContestConnection is required.");
var jwtKey = JwtKeyValidator.GetRequiredKey(builder.Configuration["Jwt:Key"]);
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "JamesThewApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "JamesThewClient";

builder.Services.AddDbContext<ContestDbContext>(options => options.UseSqlServer(contestConnection));
builder.Services.AddSingleton<RedisVoteGuard>();
builder.Services.AddScoped<ContestApplicationService>();
builder.Services.AddScoped<AnnouncementApplicationService>();
builder.Services.AddScoped<ContestLegacyImporter>();
builder.Services.AddHostedService<ContestOutboxPublisher>();
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
    var dbContext = scope.ServiceProvider.GetRequiredService<ContestDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await scope.ServiceProvider.GetRequiredService<ContestLegacyImporter>()
        .ImportAsync(CancellationToken.None);
}

app.MapGet("/health", async (ContestDbContext dbContext, CancellationToken cancellationToken) =>
    await dbContext.Database.CanConnectAsync(cancellationToken)
        ? Results.Ok(new { status = "healthy" })
        : Results.Problem("Contest database is unavailable.", statusCode: StatusCodes.Status503ServiceUnavailable));
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
