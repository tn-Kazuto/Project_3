extern alias Catalog;

using System.Net;
using System.Net.Http.Json;
using Catalog::JamesThew.CatalogService.Data;
using Catalog::JamesThew.CatalogService.DTOs;
using Catalog::JamesThew.CatalogService.Messaging;
using Catalog::JamesThew.CatalogService.Models;
using Catalog::JamesThew.CatalogService.Services;
using JamesThew.Shared.Contracts.DTOs.Billing;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend.tests;

internal sealed class CatalogServiceTestFixture : IAsyncDisposable
{
    private readonly HttpClient _billingHttpClient;
    private readonly CatalogEventPublisher _eventPublisher;
    private readonly RedisCatalogCacheTestServer _redisServer;

    private CatalogServiceTestFixture(
        CatalogDbContext database,
        HttpClient billingHttpClient,
        BillingEntitlementClient entitlementClient,
        RedisCatalogCache cache,
        CatalogEventPublisher eventPublisher,
        RedisCatalogCacheTestServer redisServer)
    {
        Database = database;
        _billingHttpClient = billingHttpClient;
        _eventPublisher = eventPublisher;
        _redisServer = redisServer;
        Recipes = new RecipeCatalogService(database, entitlementClient, cache, eventPublisher);
        Tips = new TipCatalogService(database, entitlementClient, cache);
    }

    public CatalogDbContext Database { get; }
    public RecipeCatalogService Recipes { get; }
    public TipCatalogService Tips { get; }
    public string? RedisCacheVersion => _redisServer.GetStoredValue("catalog:cache:version");
    public IReadOnlyCollection<string> RedisErrors => _redisServer.Errors;

    public static async Task<CatalogServiceTestFixture> CreateAsync(bool? subscriptionActive = null)
    {
        var options = new DbContextOptionsBuilder<CatalogDbContext>()
            .UseInMemoryDatabase($"CatalogTests_{Guid.NewGuid():N}")
            .Options;
        var database = new CatalogDbContext(options);
        var category = new CategoryRecord
        {
            CategoryId = 1,
            CategoryName = "Test Kitchen"
        };

        database.Categories.Add(category);
        database.Recipes.AddRange(
            CreateRecipe(1, 10, "Free recipe", true, category),
            CreateRecipe(2, 20, "Members recipe", false, category));
        database.Tips.AddRange(
            CreateTip(1, "Free tip", true),
            CreateTip(2, "Members tip", false));
        await database.SaveChangesAsync();

        var billingHttpClient = new HttpClient(new StubHttpMessageHandler(
            () => CreateBillingResponse(subscriptionActive)))
        {
            BaseAddress = new Uri("http://billing.test/")
        };
        var entitlementClient = new BillingEntitlementClient(
            billingHttpClient, NullLogger<BillingEntitlementClient>.Instance);
        var redisServer = new RedisCatalogCacheTestServer();
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Redis:Host"] = "127.0.0.1",
            ["Redis:Port"] = redisServer.Port.ToString(),
            ["RabbitMQ:Enabled"] = "false"
        }).Build();
        var cache = new RedisCatalogCache(configuration, NullLogger<RedisCatalogCache>.Instance);
        var eventPublisher = new CatalogEventPublisher(
            configuration, NullLogger<CatalogEventPublisher>.Instance);

        return new CatalogServiceTestFixture(
            database, billingHttpClient, entitlementClient, cache, eventPublisher, redisServer);
    }

    public async ValueTask DisposeAsync()
    {
        _billingHttpClient.Dispose();
        await _eventPublisher.DisposeAsync();
        await Database.DisposeAsync();
        await _redisServer.DisposeAsync();
    }

    private static RecipeRecord CreateRecipe(
        int id,
        int authorId,
        string title,
        bool isFree,
        CategoryRecord category) => new()
    {
        RecipeId = id,
        AuthorId = authorId,
        AuthorName = "Test Author",
        CategoryId = category.CategoryId,
        Category = category,
        Title = title,
        Ingredients = "Ingredients",
        CookingProcedure = "Method",
        IsFree = isFree,
        CreatedAt = DateTime.UtcNow
    };

    private static TipRecord CreateTip(int id, string title, bool isFree) => new()
    {
        TipId = id,
        AuthorId = 10,
        AuthorName = "Test Author",
        Title = title,
        Content = "Tip content",
        IsFree = isFree,
        CreatedAt = DateTime.UtcNow
    };

    private static HttpResponseMessage CreateBillingResponse(bool? subscriptionActive)
    {
        if (subscriptionActive is null)
        {
            return new HttpResponseMessage(HttpStatusCode.ServiceUnavailable);
        }

        var subscription = new BillingSubscriptionDto(
            UserId: 10,
            PlanType: "MONTHLY",
            Amount: 10,
            StartDate: DateTime.UtcNow.AddDays(-1),
            EndDate: DateTime.UtcNow.AddDays(29),
            IsActive: subscriptionActive.Value);
        return new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = JsonContent.Create(ApiResponse<BillingSubscriptionDto>.Ok(subscription))
        };
    }

    private sealed class StubHttpMessageHandler(Func<HttpResponseMessage> createResponse) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken) => Task.FromResult(createResponse());
    }
}
