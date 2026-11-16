extern alias Community;
extern alias Contest;

using CommunityDbContext = Community::JamesThew.CommunityService.Data.CommunityDbContext;
using CommunityApplicationService = Community::JamesThew.CommunityService.Services.CommunityApplicationService;
using CommunityModels = Community::JamesThew.CommunityService.Models;
using ContestDbContext = Contest::JamesThew.ContestService.Data.ContestDbContext;
using ContestApplicationService = Contest::JamesThew.ContestService.Services.ContestApplicationService;
using AnnouncementApplicationService = Contest::JamesThew.ContestService.Services.AnnouncementApplicationService;
using ContestModels = Contest::JamesThew.ContestService.Models;
using ContestLogger = Contest::JamesThew.ContestService.Services.ContestApplicationService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

public sealed class AdminManagementMicroservicePaginationTests
{
    [Fact]
    public async Task Contest_summary_and_paged_list_return_admin_dashboard_contract()
    {
        var options = new DbContextOptionsBuilder<ContestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var dbContext = new ContestDbContext(options);
        var activeContest = new ContestModels.ContestRecord
        {
            ContestId = 1,
            Title = "Active contest",
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(1),
            IsActive = true,
            CreatorName = "Admin"
        };
        var closedContest = new ContestModels.ContestRecord
        {
            ContestId = 2,
            Title = "Closed contest",
            StartDate = DateTime.UtcNow.AddDays(-4),
            EndDate = DateTime.UtcNow.AddDays(-2),
            IsActive = false,
            CreatorName = "Admin"
        };
        dbContext.Contests.AddRange(activeContest, closedContest);
        dbContext.Entries.Add(new ContestModels.ContestEntryRecord
        {
            ContestId = activeContest.ContestId,
            Contest = activeContest,
            Title = "Member submission",
            SubmittedAt = DateTime.UtcNow,
            SubmitterName = "Member",
            SubmitterEmail = "member@example.com"
        });
        await dbContext.SaveChangesAsync();

        var service = new ContestApplicationService(
            dbContext, null!, NullLogger<ContestLogger>.Instance);
        var summary = await service.GetSummaryAsync(CancellationToken.None);
        var page = await service.GetPagedContestsAsync(1, 1, null, CancellationToken.None);

        Assert.True(summary.Success);
        Assert.Equal(2, summary.Data!.TotalContests);
        Assert.Equal(1, summary.Data.ActiveContests);
        Assert.Equal(1, summary.Data.TotalSubmissions);
        Assert.True(page.Success);
        Assert.Equal(2, page.Data!.TotalCount);
        Assert.Single(page.Data.Items);
    }

    [Fact]
    public async Task Announcement_page_returns_only_requested_items_and_total()
    {
        var options = new DbContextOptionsBuilder<ContestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var dbContext = new ContestDbContext(options);
        dbContext.Announcements.AddRange(
            new ContestModels.AnnouncementRecord { Title = "Older", Content = "Older announcement", PublishedAt = DateTime.UtcNow.AddDays(-1) },
            new ContestModels.AnnouncementRecord { Title = "Newer", Content = "Newer announcement", PublishedAt = DateTime.UtcNow });
        await dbContext.SaveChangesAsync();

        var service = new AnnouncementApplicationService(dbContext);
        var response = await service.GetPagedAsync(1, 1, CancellationToken.None);

        Assert.True(response.Success);
        Assert.Equal(2, response.Data!.TotalCount);
        Assert.Single(response.Data.Items);
        Assert.Equal("Newer", response.Data.Items.Single().Title);
    }

    [Fact]
    public async Task Feedback_page_filters_recipe_reviews_for_admin()
    {
        var options = new DbContextOptionsBuilder<CommunityDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var dbContext = new CommunityDbContext(options);
        dbContext.Feedbacks.AddRange(
            new CommunityModels.FeedbackRecord
            {
                RecipeId = 12,
                SenderName = "Member",
                SenderEmail = "member@example.com",
                Comment = "Recipe review",
                CreatedAt = DateTime.UtcNow
            },
            new CommunityModels.FeedbackRecord
            {
                SenderName = "Guest",
                SenderEmail = "guest@example.com",
                Comment = "Site feedback",
                CreatedAt = DateTime.UtcNow.AddMinutes(-1)
            });
        await dbContext.SaveChangesAsync();

        var service = new CommunityApplicationService(dbContext);
        var response = await service.GetPagedAsync(1, 10, "RECIPE", CancellationToken.None);

        Assert.True(response.Success);
        Assert.Equal(1, response.Data!.TotalCount);
        var item = Assert.Single(response.Data.Items);
        Assert.Equal(12, item.RecipeId);
        Assert.Equal("member@example.com", item.SenderEmail);
    }
}
