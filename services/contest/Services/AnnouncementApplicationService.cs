using System.Linq.Expressions;
using System.Text.Json;
using JamesThew.ContestService.Data;
using JamesThew.ContestService.DTOs;
using JamesThew.ContestService.Models;
using JamesThew.Shared.Contracts.DTOs.Common;
using JamesThew.Shared.Contracts.Events;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.ContestService.Services;

public sealed class AnnouncementApplicationService(ContestDbContext dbContext)
{
    public async Task<ApiResponse<IEnumerable<AnnouncementDto>>> GetAllAsync(CancellationToken cancellationToken)
    {
        var announcements = await dbContext.Announcements.AsNoTracking()
            .OrderByDescending(item => item.PublishedAt)
            .Select(MapProjection())
            .ToListAsync(cancellationToken);
        return ApiResponse<IEnumerable<AnnouncementDto>>.Ok(announcements);
    }

    public async Task<ApiResponse<PagedResult<AnnouncementDto>>> GetPagedAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Announcements.AsNoTracking();
        var totalCount = await query.CountAsync(cancellationToken);
        var safePageSize = Math.Clamp(pageSize, 1, 50);
        var totalPages = (int)Math.Ceiling(totalCount / (double)safePageSize);
        var safePage = Math.Clamp(page, 1, Math.Max(1, totalPages));
        var announcements = await query
            .OrderByDescending(item => item.PublishedAt)
            .ThenByDescending(item => item.AnnouncementId)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .Select(MapProjection())
            .ToListAsync(cancellationToken);

        return ApiResponse<PagedResult<AnnouncementDto>>.Ok(new PagedResult<AnnouncementDto>
        {
            Items = announcements,
            TotalCount = totalCount,
            PageIndex = safePage,
            PageSize = safePageSize
        });
    }

    public async Task<ApiResponse<AnnouncementDto>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var announcement = await dbContext.Announcements.AsNoTracking()
            .Where(item => item.AnnouncementId == id)
            .Select(MapProjection())
            .FirstOrDefaultAsync(cancellationToken);
        return announcement is null
            ? ApiResponse<AnnouncementDto>.Fail("Announcement not found.")
            : ApiResponse<AnnouncementDto>.Ok(announcement);
    }

    public async Task<ApiResponse<AnnouncementDto>> CreateAsync(
        CreateAnnouncementRequest request,
        CancellationToken cancellationToken)
    {
        var references = await ResolveReferencesAsync(request, cancellationToken);
        if (references.Error is not null)
        {
            return ApiResponse<AnnouncementDto>.Fail(references.Error);
        }

        var announcement = CreateAnnouncement(request, references.Contest, references.Winner);
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        dbContext.Announcements.Add(announcement);
        if (references.Winner is not null && request.SendEmailNotification)
        {
            AddWinnerOutbox(references.Winner, references.Contest!, announcement);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return ApiResponse<AnnouncementDto>.Ok(MapAnnouncement(announcement), "Announcement published successfully.");
    }

    public async Task<ApiResponse<string?>> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var announcement = await dbContext.Announcements.FirstOrDefaultAsync(
            item => item.AnnouncementId == id, cancellationToken);
        if (announcement is null)
        {
            return ApiResponse<string?>.Fail("Announcement not found.");
        }

        dbContext.Announcements.Remove(announcement);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ApiResponse<string?>.Ok(null, "Announcement deleted successfully.");
    }

    public async Task<ApiResponse<ContestEntryDto>> SelectWinnerAsync(int entryId, CancellationToken cancellationToken)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        var entry = await dbContext.Entries.FirstOrDefaultAsync(item => item.EntryId == entryId, cancellationToken);
        if (entry is null)
        {
            return ApiResponse<ContestEntryDto>.Fail("Contest entry not found.");
        }

        var contest = await dbContext.Contests.FirstAsync(item => item.ContestId == entry.ContestId, cancellationToken);
        entry.IsWinner = true;
        var announcement = await dbContext.Announcements.FirstOrDefaultAsync(
            item => item.WinnerEntryId == entryId, cancellationToken);
        if (announcement is null)
        {
            announcement = CreateWinnerAnnouncement(entry, contest);
            dbContext.Announcements.Add(announcement);
            AddWinnerOutbox(entry, contest, announcement);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return ApiResponse<ContestEntryDto>.Ok(MapEntry(entry, contest), "Contest winner declared successfully.");
    }

    private async Task<AnnouncementReferences> ResolveReferencesAsync(
        CreateAnnouncementRequest request,
        CancellationToken cancellationToken)
    {
        ContestRecord? contest = null;
        if (request.ContestId.HasValue)
        {
            contest = await dbContext.Contests.AsNoTracking()
                .FirstOrDefaultAsync(item => item.ContestId == request.ContestId, cancellationToken);
            if (contest is null)
            {
                return new(null, null, "Associated contest not found.");
            }
        }

        ContestEntryRecord? winner = null;
        if (request.WinnerEntryId.HasValue)
        {
            winner = await dbContext.Entries.AsNoTracking()
                .FirstOrDefaultAsync(item => item.EntryId == request.WinnerEntryId, cancellationToken);
            if (winner is null)
            {
                return new(null, null, "Associated winner entry not found.");
            }

            if (contest is not null && contest.ContestId != winner.ContestId)
            {
                return new(null, null, "The winner entry does not belong to the selected contest.");
            }

            contest ??= await dbContext.Contests.AsNoTracking()
                .FirstOrDefaultAsync(item => item.ContestId == winner.ContestId, cancellationToken);
        }

        return new(contest, winner, null);
    }

    private static AnnouncementRecord CreateAnnouncement(
        CreateAnnouncementRequest request,
        ContestRecord? contest,
        ContestEntryRecord? winner) => new()
    {
        ContestId = request.ContestId ?? winner?.ContestId,
        ContestTitle = contest?.Title,
        WinnerEntryId = winner?.EntryId,
        WinnerTitle = winner?.Title,
        WinnerName = winner?.SubmitterName,
        WinnerEmail = winner?.SubmitterEmail,
        Title = request.Title.Trim(),
        Content = request.Content.Trim(),
        PublishedAt = DateTime.UtcNow
    };

    private static AnnouncementRecord CreateWinnerAnnouncement(ContestEntryRecord entry, ContestRecord contest)
    {
        var publishedAt = DateTime.UtcNow;
        return new AnnouncementRecord
        {
            ContestId = contest.ContestId,
            ContestTitle = contest.Title,
            WinnerEntryId = entry.EntryId,
            WinnerTitle = entry.Title,
            WinnerName = entry.SubmitterName,
            WinnerEmail = entry.SubmitterEmail,
            Title = $"Champion Crowned: {entry.Title} in {contest.Title}",
            Content = $"Chef James Thew proudly declares {entry.SubmitterName} the winner of {contest.Title} with their exceptional creation '{entry.Title}'. Congratulations on this prestigious honor!",
            PublishedAt = publishedAt
        };
    }

    private void AddWinnerOutbox(ContestEntryRecord entry, ContestRecord contest, AnnouncementRecord announcement)
    {
        var message = new ContestWinnerAnnouncedEvent(
            entry.ContestId,
            contest.Title,
            entry.EntryId,
            entry.SubmitterName,
            entry.SubmitterEmail,
            "Official Grand Champion Prize",
            announcement.Content,
            announcement.PublishedAt,
            entry.UserId);
        dbContext.OutboxMessages.Add(new ContestOutboxMessage
        {
            RoutingKey = "contest.announced",
            Payload = JsonSerializer.Serialize(message),
            CreatedAtUtc = DateTime.UtcNow
        });
    }

    private static Expression<Func<AnnouncementRecord, AnnouncementDto>> MapProjection() => announcement => new AnnouncementDto
    {
        AnnouncementId = announcement.AnnouncementId,
        ContestId = announcement.ContestId,
        ContestTitle = announcement.ContestTitle,
        WinnerEntryId = announcement.WinnerEntryId,
        WinnerTitle = announcement.WinnerTitle,
        WinnerName = announcement.WinnerName,
        Title = announcement.Title,
        Content = announcement.Content,
        PublishedAt = announcement.PublishedAt,
        IsEmailSent = announcement.IsEmailSent
    };

    private static AnnouncementDto MapAnnouncement(AnnouncementRecord announcement) => new()
    {
        AnnouncementId = announcement.AnnouncementId,
        ContestId = announcement.ContestId,
        ContestTitle = announcement.ContestTitle,
        WinnerEntryId = announcement.WinnerEntryId,
        WinnerTitle = announcement.WinnerTitle,
        WinnerName = announcement.WinnerName,
        Title = announcement.Title,
        Content = announcement.Content,
        PublishedAt = announcement.PublishedAt,
        IsEmailSent = announcement.IsEmailSent
    };

    private static ContestEntryDto MapEntry(ContestEntryRecord entry, ContestRecord contest) => new()
    {
        EntryId = entry.EntryId,
        ContestId = entry.ContestId,
        ContestTitle = contest.Title,
        ContestType = contest.ContestType,
        UserId = entry.UserId,
        SubmitterName = entry.SubmitterName,
        SubmitterEmail = entry.SubmitterEmail,
        IsGuest = entry.UserId is null,
        Title = entry.Title,
        Ingredients = entry.Ingredients,
        CookingProcedure = entry.CookingProcedure,
        TipContent = entry.TipContent,
        SubmittedAt = entry.SubmittedAt,
        IsWinner = entry.IsWinner,
        VoteCount = entry.VoteCount
    };

    private sealed record AnnouncementReferences(ContestRecord? Contest, ContestEntryRecord? Winner, string? Error);
}
