using JamesThew.Gateway.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// 1. Thêm cấu hình YARP Reverse Proxy từ appsettings.json
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// 2. Cấu hình CORS cho phép React SPA kết nối
builder.Services.AddCors(options =>
{
    options.AddPolicy("GatewayCorsPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 3. Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// 4. Pipeline Middleware
app.UseCors("GatewayCorsPolicy");

// Health check endpoint cho Docker / Kubernetes
app.MapHealthChecks("/health");

// Gateway Identity Propagation Middleware (Forward Claims sang Microservices)
app.UseMiddleware<GatewayTokenPropagationMiddleware>();

// Reverse Proxy Endpoints
app.MapReverseProxy();

app.Run();

