extern alias Catalog;

using Catalog::JamesThew.CatalogService.DTOs;
using Catalog::JamesThew.CatalogService.Models;
using Xunit;

namespace backend.tests;

public sealed class CatalogServiceTests
{
    private static readonly CancellationToken TestCancellationToken = CancellationToken.None;

    [Fact]
    public async Task Guest_recipe_and_tip_lists_only_return_free_content_when_redis_is_unavailable()
    {
        await using var fixture = await CatalogServiceTestFixture.CreateAsync();
        var guest = new CatalogActor(null, null, null, null);

        var recipes = await fixture.Recipes.GetAllAsync(null, null, null, null, guest, TestCancellationToken);
        var tips = await fixture.Tips.GetAllAsync(null, guest, TestCancellationToken);

        Assert.True(recipes.Success);
        Assert.Equal(new[] { "Free recipe" }, recipes.Data!.Select(item => item.Title));
        Assert.True(tips.Success);
        Assert.Equal(new[] { "Free tip" }, tips.Data!.Select(item => item.Title));
    }

    [Fact]
    public async Task Active_member_can_read_paid_recipe_and_tip_content()
    {
        await using var fixture = await CatalogServiceTestFixture.CreateAsync(subscriptionActive: true);
        var member = new CatalogActor(10, "MEMBER", "Test Member", "Bearer valid-token");

        var recipe = await fixture.Recipes.GetByIdAsync(2, member, TestCancellationToken);
        var tip = await fixture.Tips.GetByIdAsync(2, member, TestCancellationToken);

        Assert.True(recipe.Success);
        Assert.False(recipe.Data!.IsFree);
        Assert.True(tip.Success);
        Assert.False(tip.Data!.IsFree);
    }

    [Fact]
    public async Task Expired_or_unavailable_membership_never_grants_paid_content()
    {
        await using var expiredFixture = await CatalogServiceTestFixture.CreateAsync(subscriptionActive: false);
        await using var unavailableFixture = await CatalogServiceTestFixture.CreateAsync();
        var member = new CatalogActor(10, "MEMBER", "Test Member", "Bearer valid-token");

        var expiredResult = await expiredFixture.Recipes.GetByIdAsync(2, member, TestCancellationToken);
        var unavailableResult = await unavailableFixture.Tips.GetByIdAsync(2, member, TestCancellationToken);

        Assert.False(expiredResult.Success);
        Assert.Contains("SUBSCRIPTION_EXPIRED", expiredResult.Message);
        Assert.False(unavailableResult.Success);
        Assert.Contains("SUBSCRIPTION_STATUS_UNAVAILABLE", unavailableResult.Message);
    }

    [Fact]
    public async Task Member_cannot_create_paid_content_or_edit_another_authors_recipe()
    {
        await using var fixture = await CatalogServiceTestFixture.CreateAsync(subscriptionActive: true);
        var member = new CatalogActor(10, "MEMBER", "Test Member", "Bearer valid-token");
        var request = new CreateRecipeRequest
        {
            CategoryId = 1,
            Title = "Member contribution",
            Ingredients = "Ingredients",
            CookingProcedure = "Method",
            IsFree = true
        };

        var created = await fixture.Recipes.CreateAsync(request, member, TestCancellationToken);
        var denied = await fixture.Recipes.UpdateAsync(2, new UpdateRecipeRequest
        {
            CategoryId = 1,
            Title = "Changed title",
            Ingredients = "Ingredients",
            CookingProcedure = "Method"
        }, member, TestCancellationToken);

        Assert.True(created.Success);
        Assert.False(created.Data!.IsFree);
        Assert.False(denied.Success);
        Assert.Contains("FORBIDDEN", denied.Message);
        Assert.Equal("Members recipe", fixture.Database.Recipes.Single(recipe => recipe.RecipeId == 2).Title);
    }

    [Fact]
    public async Task Admin_can_edit_another_authors_recipe_and_change_access_tier()
    {
        await using var fixture = await CatalogServiceTestFixture.CreateAsync();
        var admin = new CatalogActor(1, "ADMIN", "Site Admin", "Bearer valid-token");

        var updated = await fixture.Recipes.UpdateAsync(2, new UpdateRecipeRequest
        {
            CategoryId = 1,
            Title = "Admin updated recipe",
            Ingredients = "Ingredients",
            CookingProcedure = "Method",
            IsFree = true
        }, admin, TestCancellationToken);

        Assert.True(updated.Success);
        Assert.True(updated.Data!.IsFree);
        Assert.Equal("Admin updated recipe", fixture.Database.Recipes.Single(recipe => recipe.RecipeId == 2).Title);
        Assert.True(
            fixture.RedisCacheVersion == "1",
            $"Expected one cache version increment. Server errors: {string.Join("; ", fixture.RedisErrors)}.");
    }

    [Fact]
    public async Task Admin_paged_lists_include_member_authored_recipes_and_tips_across_pages()
    {
        await using var fixture = await CatalogServiceTestFixture.CreateAsync();
        var admin = new CatalogActor(1, "ADMIN", "Site Admin", "Bearer valid-token");

        var recipeFirstPage = await fixture.Recipes.GetPagedAsync(
            1, 1, null, null, null, null, admin, TestCancellationToken);
        var recipeSecondPage = await fixture.Recipes.GetPagedAsync(
            2, 1, null, null, null, null, admin, TestCancellationToken);
        var tipPage = await fixture.Tips.GetPagedAsync(
            1, 10, null, admin, TestCancellationToken);

        Assert.True(recipeFirstPage.Success);
        Assert.Equal(2, recipeFirstPage.Data!.TotalCount);
        Assert.Equal(1, recipeFirstPage.Data.PageSize);
        Assert.True(recipeSecondPage.Success);
        Assert.Contains(
            "Members recipe",
            recipeFirstPage.Data.Items.Concat(recipeSecondPage.Data!.Items).Select(item => item.Title));
        Assert.True(tipPage.Success);
        Assert.Contains("Members tip", tipPage.Data!.Items.Select(item => item.Title));
    }
}
