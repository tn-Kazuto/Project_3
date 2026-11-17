using System.Text;
using JamesThew.PaymentService.Data;
using JamesThew.PaymentService.Services;
using JamesThew.Shared.Contracts.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var paymentConnection = builder.Configuration.GetConnectionString("PaymentConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:PaymentConnection is required.");
var legacyConnection = builder.Configuration.GetConnectionString("LegacyConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:LegacyConnection is required for initial payment data import.");
var jwtKey = JwtKeyValidator.GetRequiredKey(builder.Configuration["Jwt:Key"]);
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "JamesThewApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "JamesThewClient";

builder.Services.AddDbContext<PaymentDbContext>(options => options.UseSqlServer(paymentConnection));
builder.Services.AddDbContext<LegacyPaymentDbContext>(options => options.UseSqlServer(legacyConnection));
builder.Services.AddScoped<PaymentApplicationService>();
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
    var paymentDb = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
    await paymentDb.Database.EnsureCreatedAsync();
    var legacyDb = scope.ServiceProvider.GetRequiredService<LegacyPaymentDbContext>();
    await scope.ServiceProvider.GetRequiredService<PaymentApplicationService>()
        .ImportLegacyDataAsync(legacyDb, CancellationToken.None);
}

app.MapGet("/health", async (PaymentDbContext dbContext, CancellationToken cancellationToken) =>
    await dbContext.Database.CanConnectAsync(cancellationToken)
        ? Results.Ok(new { status = "healthy" })
        : Results.Problem("Payment database is unavailable.", statusCode: StatusCodes.Status503ServiceUnavailable));
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
