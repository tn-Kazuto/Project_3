using System.Security.Claims;
using System.Text;
using JamesThew.NotificationService.Data;
using JamesThew.NotificationService.Hubs;
using JamesThew.NotificationService.Messaging;
using JamesThew.NotificationService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("NotificationConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:NotificationConnection is required.");
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is required.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "JamesThewApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "JamesThewClient";

builder.Services.AddDbContext<NotificationDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<LegacyNotificationImporter>();
builder.Services.AddScoped<NotificationApplicationService>();
builder.Services.AddScoped<NotificationEventProcessor>();
builder.Services.AddSingleton<IEmailDispatcher, EmailDispatcher>();
builder.Services.AddSingleton<NotificationWorkerStatus>();
builder.Services.AddHostedService<RabbitMqNotificationWorker>();
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/hub/notifications"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    var importer = scope.ServiceProvider.GetRequiredService<LegacyNotificationImporter>();
    await importer.ImportAsync(CancellationToken.None);
    scope.ServiceProvider.GetRequiredService<NotificationWorkerStatus>().LegacyImportReady = true;
}

app.MapGet("/health", async (
    NotificationDbContext dbContext,
    NotificationWorkerStatus workerStatus,
    CancellationToken cancellationToken) =>
    workerStatus.IsReady && workerStatus.LegacyImportReady && await dbContext.Database.CanConnectAsync(cancellationToken)
        ? Results.Ok(new { status = "healthy" })
        : Results.Problem("Notification service dependencies are unavailable.", statusCode: StatusCodes.Status503ServiceUnavailable));
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationsHub>("/hub/notifications");

app.Run();
