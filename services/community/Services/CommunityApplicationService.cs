using JamesThew.CommunityService.Data;
using JamesThew.CommunityService.DTOs;
using JamesThew.CommunityService.Models;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.CommunityService.Services;

public sealed class CommunityApplicationService(CommunityDbContext dbContext)
{
    public async Task<ApiResponse<FeedbackDto>> CreateFeedbackAsync(
        CreateFeedbackRequest request,
        int? userId,
        string? authenticatedName,
        string? authenticatedEmail,
        CancellationToken cancellationToken)
    {
        var validationError = ValidateFeedback(request, userId, authenticatedEmail);
        if (validationError is not null)
        {
            return ApiResponse<FeedbackDto>.Fail(validationError);
        }

        var sender = ResolveSender(request, userId, authenticatedName, authenticatedEmail);
        var feedback = new FeedbackRecord
        {
            RecipeId = request.RecipeId,
            UserId = userId,
            SenderName = sender.Name,
            SenderEmail = sender.Email,
            Comment = request.Comment.Trim(),
            MediaUrl = request.MediaUrl?.Trim(),
            Rating = request.Rating,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Feedbacks.Add(feedback);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ApiResponse<FeedbackDto>.Ok(MapFeedback(feedback, includePrivateDetails: true),
            "Feedback submitted successfully. Thank you!");
    }

    public async Task<ApiResponse<IEnumerable<FeedbackDto>>> GetByRecipeAsync(
        int recipeId,
        CancellationToken cancellationToken)
    {
        var feedback = await dbContext.Feedbacks.AsNoTracking()
            .Where(item => item.RecipeId == recipeId)
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new FeedbackDto
            {
                FeedbackId = item.FeedbackId,
                RecipeId = item.RecipeId,
                RecipeTitle = item.RecipeTitle,
                UserId = null,
                SenderName = item.SenderName,
                SenderEmail = string.Empty,
                Comment = item.Comment,
                MediaUrl = item.MediaUrl,
                Rating = item.Rating,
                CreatedAt = item.CreatedAt,
                IsGuest = item.UserId == null
            })
            .ToListAsync(cancellationToken);
        AddRecipeTitleFallback(feedback);
        return ApiResponse<IEnumerable<FeedbackDto>>.Ok(feedback);
    }

    public async Task<ApiResponse<IEnumerable<FeedbackDto>>> GetAllAsync(CancellationToken cancellationToken)
    {
        var feedback = await dbContext.Feedbacks.AsNoTracking()
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new FeedbackDto
            {
                FeedbackId = item.FeedbackId,
                RecipeId = item.RecipeId,
                RecipeTitle = item.RecipeTitle,
                UserId = item.UserId,
                SenderName = item.SenderName,
                SenderEmail = item.SenderEmail,
                Comment = item.Comment,
                MediaUrl = item.MediaUrl,
                Rating = item.Rating,
                CreatedAt = item.CreatedAt,
                IsGuest = item.UserId == null
            })
            .ToListAsync(cancellationToken);
        AddRecipeTitleFallback(feedback);
        return ApiResponse<IEnumerable<FeedbackDto>>.Ok(feedback);
    }

    public async Task<ApiResponse<PagedResult<FeedbackDto>>> GetPagedAsync(
        int page,
        int pageSize,
        string? feedbackType,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Feedbacks.AsNoTracking();
        query = feedbackType?.Trim().ToUpperInvariant() switch
        {
            "RECIPE" => query.Where(item => item.RecipeId.HasValue),
            "GENERAL" => query.Where(item => !item.RecipeId.HasValue),
            _ => query
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var safePageSize = Math.Clamp(pageSize, 1, 50);
        var totalPages = (int)Math.Ceiling(totalCount / (double)safePageSize);
        var safePage = Math.Clamp(page, 1, Math.Max(1, totalPages));
        var feedback = await query
            .OrderByDescending(item => item.CreatedAt)
            .ThenByDescending(item => item.FeedbackId)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .Select(item => new FeedbackDto
            {
                FeedbackId = item.FeedbackId,
                RecipeId = item.RecipeId,
                RecipeTitle = item.RecipeTitle,
                UserId = item.UserId,
                SenderName = item.SenderName,
                SenderEmail = item.SenderEmail,
                Comment = item.Comment,
                MediaUrl = item.MediaUrl,
                Rating = item.Rating,
                CreatedAt = item.CreatedAt,
                IsGuest = item.UserId == null
            })
            .ToListAsync(cancellationToken);
        AddRecipeTitleFallback(feedback);

        return ApiResponse<PagedResult<FeedbackDto>>.Ok(new PagedResult<FeedbackDto>
        {
            Items = feedback,
            TotalCount = totalCount,
            PageIndex = safePage,
            PageSize = safePageSize
        });
    }

    public async Task<ApiResponse<string?>> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var feedback = await dbContext.Feedbacks.FirstOrDefaultAsync(
            item => item.FeedbackId == id, cancellationToken);
        if (feedback is null)
        {
            return ApiResponse<string?>.Fail("Feedback entry not found.");
        }

        dbContext.Feedbacks.Remove(feedback);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ApiResponse<string?>.Ok(null, "Feedback deleted successfully.");
    }

    public async Task<ApiResponse<int>> RecordShareAsync(
        int recipeId,
        int? userId,
        string? channel,
        CancellationToken cancellationToken)
    {
        dbContext.ShareLogs.Add(new ShareLogRecord
        {
            RecipeId = recipeId,
            UserId = userId,
            Channel = NormalizeShareChannel(channel),
            SharedAtUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync(cancellationToken);
        var total = await GetShareCountValueAsync(recipeId, cancellationToken);
        return ApiResponse<int>.Ok(total, "Share count incremented successfully.");
    }

    public async Task<ApiResponse<int>> GetShareCountAsync(int recipeId, CancellationToken cancellationToken)
    {
        var total = await GetShareCountValueAsync(recipeId, cancellationToken);
        return ApiResponse<int>.Ok(total);
    }

    public async Task<ApiResponse<Dictionary<int, int>>> GetShareCountsAsync(
        IReadOnlyCollection<int> recipeIds,
        CancellationToken cancellationToken)
    {
        var distinctIds = recipeIds.Distinct().ToArray();
        var baselines = await dbContext.RecipeShareBaselines.AsNoTracking()
            .Where(item => distinctIds.Contains(item.RecipeId))
            .ToDictionaryAsync(item => item.RecipeId, item => item.LegacyShareCount, cancellationToken);
        var loggedShares = await dbContext.ShareLogs.AsNoTracking()
            .Where(item => distinctIds.Contains(item.RecipeId))
            .GroupBy(item => item.RecipeId)
            .Select(group => new { RecipeId = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.RecipeId, item => item.Count, cancellationToken);

        var totals = distinctIds.ToDictionary(
            recipeId => recipeId,
            recipeId => checked(
                (baselines.TryGetValue(recipeId, out var baseline) ? baseline : 0) +
                (loggedShares.TryGetValue(recipeId, out var count) ? count : 0)));
        return ApiResponse<Dictionary<int, int>>.Ok(totals);
    }

    public async Task<ApiResponse<RecipeRatingSummaryDto>> GetRatingSummaryAsync(
        int recipeId,
        CancellationToken cancellationToken)
    {
        var ratings = dbContext.Feedbacks.AsNoTracking().Where(item => item.RecipeId == recipeId);
        var ratingCount = await ratings.CountAsync(item => item.Rating.HasValue, cancellationToken);
        var feedbackCount = await ratings.CountAsync(cancellationToken);
        var average = ratingCount == 0
            ? null
            : await ratings.Where(item => item.Rating.HasValue)
                .AverageAsync(item => (double?)item.Rating, cancellationToken);
        return ApiResponse<RecipeRatingSummaryDto>.Ok(new RecipeRatingSummaryDto
        {
            RecipeId = recipeId,
            RatingCount = ratingCount,
            AverageRating = average,
            FeedbackCount = feedbackCount
        });
    }

    private async Task<int> GetShareCountValueAsync(int recipeId, CancellationToken cancellationToken)
    {
        var legacyCount = await dbContext.RecipeShareBaselines.AsNoTracking()
            .Where(item => item.RecipeId == recipeId)
            .Select(item => (int?)item.LegacyShareCount)
            .FirstOrDefaultAsync(cancellationToken) ?? 0;
        var newShares = await dbContext.ShareLogs.CountAsync(item => item.RecipeId == recipeId, cancellationToken);
        return checked(legacyCount + newShares);
    }

    private static string? ValidateFeedback(CreateFeedbackRequest request, int? userId, string? authenticatedEmail)
    {
        if (request.RecipeId is <= 0)
        {
            return "Recipe ID must be a positive value.";
        }

        if (userId.HasValue && string.IsNullOrWhiteSpace(authenticatedEmail))
        {
            return "Authenticated user email is missing from the access token.";
        }

        if (!userId.HasValue &&
            (string.IsNullOrWhiteSpace(request.SenderName) || string.IsNullOrWhiteSpace(request.SenderEmail)))
        {
            return "Name and email are required when submitting feedback as a guest.";
        }

        if (!string.IsNullOrWhiteSpace(request.MediaUrl) &&
            (!Uri.TryCreate(request.MediaUrl.Trim(), UriKind.Absolute, out var mediaUri) ||
             mediaUri.Scheme != Uri.UriSchemeHttps))
        {
            return "Media URL must be a valid HTTPS URL.";
        }

        return null;
    }

    private static (string Name, string Email) ResolveSender(
        CreateFeedbackRequest request,
        int? userId,
        string? authenticatedName,
        string? authenticatedEmail) => userId.HasValue
        ? (string.IsNullOrWhiteSpace(authenticatedName) ? "Member" : authenticatedName.Trim(),
            authenticatedEmail!.Trim().ToLowerInvariant())
        : (request.SenderName!.Trim(), request.SenderEmail!.Trim().ToLowerInvariant());

    private static string NormalizeShareChannel(string? channel)
    {
        var normalized = channel?.Trim().ToLowerInvariant();
        return normalized is "facebook" or "link" ? normalized : "external";
    }

    private static FeedbackDto MapFeedback(FeedbackRecord feedback, bool includePrivateDetails) => new()
    {
        FeedbackId = feedback.FeedbackId,
        RecipeId = feedback.RecipeId,
        RecipeTitle = feedback.RecipeTitle,
        UserId = includePrivateDetails ? feedback.UserId : null,
        SenderName = feedback.SenderName,
        SenderEmail = includePrivateDetails ? feedback.SenderEmail : string.Empty,
        Comment = feedback.Comment,
        MediaUrl = feedback.MediaUrl,
        Rating = feedback.Rating,
        CreatedAt = feedback.CreatedAt,
        IsGuest = feedback.UserId is null
    };

    private static void AddRecipeTitleFallback(IEnumerable<FeedbackDto> feedback)
    {
        foreach (var item in feedback.Where(item => item.RecipeId.HasValue && string.IsNullOrWhiteSpace(item.RecipeTitle)))
        {
            item.RecipeTitle = $"Recipe #{item.RecipeId}";
        }
    }
}
