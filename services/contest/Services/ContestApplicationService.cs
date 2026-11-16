using JamesThew.ContestService.Data;
using JamesThew.ContestService.DTOs;
using JamesThew.ContestService.Models;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace JamesThew.ContestService.Services;

public sealed class ContestApplicationService(
    ContestDbContext dbContext,
    RedisVoteGuard redisVoteGuard,
    ILogger<ContestApplicationService> logger)
{
    public async Task<ApiResponse<IEnumerable<ContestDto>>> GetContestsAsync(bool? activeOnly, CancellationToken cancellationToken)
    {
        var query = dbContext.Contests.AsNoTracking();
        if (activeOnly == true)
        {
            var now = DateTime.UtcNow;
            query = query.Where(contest => contest.IsActive && contest.EndDate >= now);
        }

        var contests = await query.OrderByDescending(contest => contest.StartDate)
            .Select(contest => new ContestDto
            {
                ContestId = contest.ContestId,
                Title = contest.Title,
                Description = contest.Description,
                ContestType = contest.ContestType,
                StartDate = contest.StartDate,
                EndDate = contest.EndDate,
                IsActive = contest.IsActive,
                CreatedBy = contest.CreatedBy,
                CreatorName = contest.CreatorName,
                EntryCount = contest.Entries.Count
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<IEnumerable<ContestDto>>.Ok(contests);
    }

    public async Task<ApiResponse<ContestSummaryDto>> GetSummaryAsync(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var summary = new ContestSummaryDto
        {
            TotalContests = await dbContext.Contests.CountAsync(cancellationToken),
            ActiveContests = await dbContext.Contests.CountAsync(
                contest => contest.IsActive && contest.EndDate >= now, cancellationToken),
            TotalSubmissions = await dbContext.Entries.CountAsync(cancellationToken)
        };
        return ApiResponse<ContestSummaryDto>.Ok(summary);
    }

    public async Task<ApiResponse<PagedResult<ContestDto>>> GetPagedContestsAsync(
        int page,
        int pageSize,
        bool? activeOnly,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Contests.AsNoTracking();
        if (activeOnly == true)
        {
            var now = DateTime.UtcNow;
            query = query.Where(contest => contest.IsActive && contest.EndDate >= now);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var safePageSize = Math.Clamp(pageSize, 1, 50);
        var totalPages = (int)Math.Ceiling(totalCount / (double)safePageSize);
        var safePage = Math.Clamp(page, 1, Math.Max(1, totalPages));
        var contests = await query
            .OrderByDescending(contest => contest.StartDate)
            .ThenByDescending(contest => contest.ContestId)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .Select(contest => new ContestDto
            {
                ContestId = contest.ContestId,
                Title = contest.Title,
                Description = contest.Description,
                ContestType = contest.ContestType,
                StartDate = contest.StartDate,
                EndDate = contest.EndDate,
                IsActive = contest.IsActive,
                CreatedBy = contest.CreatedBy,
                CreatorName = contest.CreatorName,
                EntryCount = contest.Entries.Count
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<PagedResult<ContestDto>>.Ok(new PagedResult<ContestDto>
        {
            Items = contests,
            TotalCount = totalCount,
            PageIndex = safePage,
            PageSize = safePageSize
        });
    }

    public async Task<ApiResponse<ContestDto>> GetContestAsync(int id, CancellationToken cancellationToken)
    {
        var contest = await dbContext.Contests.AsNoTracking()
            .Where(item => item.ContestId == id)
            .Select(item => new ContestDto
            {
                ContestId = item.ContestId,
                Title = item.Title,
                Description = item.Description,
                ContestType = item.ContestType,
                StartDate = item.StartDate,
                EndDate = item.EndDate,
                IsActive = item.IsActive,
                CreatedBy = item.CreatedBy,
                CreatorName = item.CreatorName,
                EntryCount = item.Entries.Count
            })
            .FirstOrDefaultAsync(cancellationToken);

        return contest is null
            ? ApiResponse<ContestDto>.Fail("Contest not found.")
            : ApiResponse<ContestDto>.Ok(contest);
    }

    public async Task<ApiResponse<ContestDto>> CreateContestAsync(
        CreateContestRequest request,
        int adminId,
        string creatorName,
        CancellationToken cancellationToken)
    {
        var contestType = request.ContestType.Trim().ToUpperInvariant();
        if (contestType is not ("RECIPE" or "TIP"))
        {
            return ApiResponse<ContestDto>.Fail("Invalid contest type. Allowed values: 'RECIPE' or 'TIP'.");
        }

        if (request.EndDate <= request.StartDate)
        {
            return ApiResponse<ContestDto>.Fail("End date must be later than start date.");
        }

        var contest = new ContestRecord
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            ContestType = contestType,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = request.IsActive,
            CreatedBy = adminId,
            CreatorName = string.IsNullOrWhiteSpace(creatorName) ? "Admin" : creatorName.Trim()
        };

        dbContext.Contests.Add(contest);
        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetContestAsync(contest.ContestId, cancellationToken);
    }

    public async Task<ApiResponse<string?>> DeleteContestAsync(int id, CancellationToken cancellationToken)
    {
        var contest = await dbContext.Contests.FirstOrDefaultAsync(item => item.ContestId == id, cancellationToken);
        if (contest is null)
        {
            return ApiResponse<string?>.Fail("Contest not found.");
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        await dbContext.Announcements.Where(item => item.ContestId == id)
            .ExecuteDeleteAsync(cancellationToken);
        dbContext.Contests.Remove(contest);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return ApiResponse<string?>.Ok(null, "Contest deleted successfully.");
    }

    public async Task<ApiResponse<ContestEntryDto>> SubmitEntryAsync(
        int contestId,
        SubmitEntryRequest request,
        int? userId,
        string submitterName,
        string submitterEmail,
        CancellationToken cancellationToken)
    {
        var contest = await dbContext.Contests.AsNoTracking()
            .FirstOrDefaultAsync(item => item.ContestId == contestId, cancellationToken);
        if (contest is null)
        {
            return ApiResponse<ContestEntryDto>.Fail("Contest not found.");
        }

        var validationError = ValidateSubmission(request, contest, userId);
        if (validationError is not null)
        {
            return ApiResponse<ContestEntryDto>.Fail(validationError);
        }

        var entry = CreateEntry(contestId, request, contest, userId, submitterName, submitterEmail);
        dbContext.Entries.Add(entry);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ApiResponse<ContestEntryDto>.Ok(MapEntry(entry, contest), "Contest entry submitted successfully!");
    }

    public async Task<ApiResponse<IEnumerable<ContestEntryDto>>> GetEntriesAsync(
        int contestId,
        int? userId,
        string guestVoteToken,
        bool? orderByVotes,
        bool includePrivateDetails,
        CancellationToken cancellationToken)
    {
        var contest = await dbContext.Contests.AsNoTracking()
            .FirstOrDefaultAsync(item => item.ContestId == contestId, cancellationToken);
        if (contest is null)
        {
            return ApiResponse<IEnumerable<ContestEntryDto>>.Fail("Contest not found.");
        }

        var query = dbContext.Entries.AsNoTracking().Where(entry => entry.ContestId == contestId);
        query = orderByVotes == true
            ? query.OrderByDescending(entry => entry.VoteCount).ThenByDescending(entry => entry.SubmittedAt)
            : query.OrderByDescending(entry => entry.SubmittedAt);
        var entries = await query.ToListAsync(cancellationToken);
        var entryIds = entries.Select(entry => entry.EntryId).ToArray();
        var voterIdentifier = userId.HasValue ? $"USER_{userId.Value}" : $"GUEST_{guestVoteToken}";
        var votedEntryIds = await dbContext.Votes.AsNoTracking()
            .Where(vote => entryIds.Contains(vote.ContestEntryId) &&
                ((userId.HasValue && vote.UserId == userId.Value) ||
                 (!userId.HasValue && vote.VoterIpOrEmail == voterIdentifier)))
            .Select(vote => vote.ContestEntryId)
            .ToHashSetAsync(cancellationToken);

        var results = entries.Select(entry =>
        {
            var dto = MapEntry(entry, contest, includePrivateDetails);
            dto.HasUserVoted = votedEntryIds.Contains(entry.EntryId);
            return dto;
        }).ToList();
        return ApiResponse<IEnumerable<ContestEntryDto>>.Ok(results);
    }

    public async Task<ApiResponse<PagedResult<ContestEntryDto>>> GetPagedEntriesAsync(
        int contestId,
        int page,
        int pageSize,
        int? userId,
        string guestVoteToken,
        bool? orderByVotes,
        CancellationToken cancellationToken)
    {
        var contest = await dbContext.Contests.AsNoTracking()
            .FirstOrDefaultAsync(item => item.ContestId == contestId, cancellationToken);
        if (contest is null)
        {
            return ApiResponse<PagedResult<ContestEntryDto>>.Fail("Contest not found.");
        }

        var query = dbContext.Entries.AsNoTracking().Where(entry => entry.ContestId == contestId);
        var totalCount = await query.CountAsync(cancellationToken);
        var safePageSize = Math.Clamp(pageSize, 1, 50);
        var totalPages = (int)Math.Ceiling(totalCount / (double)safePageSize);
        var safePage = Math.Clamp(page, 1, Math.Max(1, totalPages));
        var orderedQuery = orderByVotes == true
            ? query.OrderByDescending(entry => entry.VoteCount).ThenByDescending(entry => entry.SubmittedAt).ThenByDescending(entry => entry.EntryId)
            : query.OrderByDescending(entry => entry.SubmittedAt).ThenByDescending(entry => entry.EntryId);
        var entries = await orderedQuery
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .ToListAsync(cancellationToken);
        var entryIds = entries.Select(entry => entry.EntryId).ToArray();
        var voterIdentifier = userId.HasValue ? $"USER_{userId.Value}" : $"GUEST_{guestVoteToken}";
        var votedEntryIds = await dbContext.Votes.AsNoTracking()
            .Where(vote => entryIds.Contains(vote.ContestEntryId) &&
                ((userId.HasValue && vote.UserId == userId.Value) ||
                 (!userId.HasValue && vote.VoterIpOrEmail == voterIdentifier)))
            .Select(vote => vote.ContestEntryId)
            .ToHashSetAsync(cancellationToken);

        var results = entries.Select(entry =>
        {
            var dto = MapEntry(entry, contest);
            dto.HasUserVoted = votedEntryIds.Contains(entry.EntryId);
            return dto;
        }).ToList();

        return ApiResponse<PagedResult<ContestEntryDto>>.Ok(new PagedResult<ContestEntryDto>
        {
            Items = results,
            TotalCount = totalCount,
            PageIndex = safePage,
            PageSize = safePageSize
        });
    }

    public async Task<ApiResponse<ContestVoteResultDto>> VoteAsync(
        int entryId,
        VoteContestEntryRequest request,
        int? userId,
        string guestVoteToken,
        CancellationToken cancellationToken)
    {
        var entrySnapshot = await dbContext.Entries.AsNoTracking()
            .Where(item => item.EntryId == entryId)
            .Select(item => new { item.Contest.IsActive, item.Contest.EndDate })
            .FirstOrDefaultAsync(cancellationToken);
        if (entrySnapshot is null)
        {
            return ApiResponse<ContestVoteResultDto>.Fail("Contest entry not found.");
        }

        if (!entrySnapshot.IsActive || entrySnapshot.EndDate < DateTime.UtcNow)
        {
            return ApiResponse<ContestVoteResultDto>.Fail("Voting is closed for this contest.");
        }

        var identity = CreateVoteIdentity(entryId, request, userId, guestVoteToken, entrySnapshot.EndDate);
        return await CastVoteAsync(entryId, userId, identity, cancellationToken);
    }

    private static ApiResponse<ContestVoteResultDto> AlreadyVoted() =>
        ApiResponse<ContestVoteResultDto>.Fail("You have already voted for this culinary entry.");

    private static string? ValidateSubmission(SubmitEntryRequest request, ContestRecord contest, int? userId)
    {
        if (!contest.IsActive || contest.EndDate < DateTime.UtcNow)
        {
            return "This contest is closed and no longer accepting submissions.";
        }

        if (userId is null && (string.IsNullOrWhiteSpace(request.GuestName) || string.IsNullOrWhiteSpace(request.GuestEmail)))
        {
            return "Guest submitters must provide their full name and a valid email address.";
        }

        if (contest.ContestType == "RECIPE" &&
            (string.IsNullOrWhiteSpace(request.Ingredients) || string.IsNullOrWhiteSpace(request.CookingProcedure)))
        {
            return "Recipe submissions must include the ingredients list and cooking procedure.";
        }

        return contest.ContestType == "TIP" && string.IsNullOrWhiteSpace(request.TipContent)
            ? "Tip submissions must include the tip content."
            : null;
    }

    private static ContestEntryRecord CreateEntry(
        int contestId,
        SubmitEntryRequest request,
        ContestRecord contest,
        int? userId,
        string submitterName,
        string submitterEmail) => new()
    {
        ContestId = contestId,
        UserId = userId,
        GuestName = userId is null ? request.GuestName?.Trim() : null,
        GuestEmail = userId is null ? request.GuestEmail?.Trim().ToLowerInvariant() : null,
        SubmitterName = userId is null ? request.GuestName!.Trim() :
            string.IsNullOrWhiteSpace(submitterName) ? "Member" : submitterName,
        SubmitterEmail = userId is null ? request.GuestEmail!.Trim().ToLowerInvariant() : submitterEmail,
        Title = request.Title.Trim(),
        Ingredients = contest.ContestType == "RECIPE" ? request.Ingredients?.Trim() : null,
        CookingProcedure = contest.ContestType == "RECIPE" ? request.CookingProcedure?.Trim() : null,
        TipContent = contest.ContestType == "TIP" ? request.TipContent?.Trim() : null,
        SubmittedAt = DateTime.UtcNow
    };

    private async Task<ApiResponse<ContestVoteResultDto>> CastVoteAsync(
        int entryId,
        int? userId,
        VoteIdentity identity,
        CancellationToken cancellationToken)
    {
        var reserved = await redisVoteGuard.TryReserveAsync(identity.RedisKey, identity.TtlSeconds, cancellationToken);
        if (reserved == false)
        {
            return AlreadyVoted();
        }

        try
        {
            var response = await PersistVoteAsync(entryId, userId, identity, cancellationToken);
            if (!response.Success)
            {
                await ReleaseReservationAsync(identity, reserved, cancellationToken);
                return response;
            }

            var vote = response.Data!;
            var counter = await redisVoteGuard.SynchronizeVoteCountAsync(
                $"contest:count:{entryId}", vote.NewVoteCount, cancellationToken);
            vote.NewVoteCount = counter ?? vote.NewVoteCount;
            return response;
        }
        catch (OperationCanceledException)
        {
            await ReleaseReservationAsync(identity, reserved, CancellationToken.None);
            throw;
        }
        catch (DbUpdateException exception) when (IsDuplicateVoteViolation(exception))
        {
            await ReleaseReservationAsync(identity, reserved, cancellationToken);
            return AlreadyVoted();
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            await ReleaseReservationAsync(identity, reserved, cancellationToken);
            logger.LogError(exception, "Failed to persist vote for contest entry {EntryId}.", entryId);
            throw;
        }
    }

    private async Task<ApiResponse<ContestVoteResultDto>> PersistVoteAsync(
        int entryId,
        int? userId,
        VoteIdentity identity,
        CancellationToken cancellationToken)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(
            System.Data.IsolationLevel.Serializable, cancellationToken);
        var entry = await dbContext.Entries.FirstAsync(item => item.EntryId == entryId, cancellationToken);
        if (await HasAlreadyVotedAsync(entryId, userId, identity.VoterKey, identity.VoterIpOrEmail, cancellationToken))
        {
            await transaction.RollbackAsync(cancellationToken);
            return AlreadyVoted();
        }

        entry.VoteCount++;
        dbContext.Votes.Add(CreateVote(entryId, userId, identity));
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return ApiResponse<ContestVoteResultDto>.Ok(new ContestVoteResultDto
        {
            EntryId = entryId,
            NewVoteCount = entry.VoteCount,
            HasVoted = true,
            Message = "Your vote has been successfully recorded. Thank you for supporting community creations!"
        });
    }

    private Task<bool> HasAlreadyVotedAsync(
        int entryId,
        int? userId,
        string voterKey,
        string voterIpOrEmail,
        CancellationToken cancellationToken) =>
        dbContext.Votes.AnyAsync(vote => vote.ContestEntryId == entryId &&
            ((userId.HasValue && vote.UserId == userId.Value) ||
             vote.VoterIpOrEmail == voterIpOrEmail || vote.VoterKey == voterKey), cancellationToken);

    private static ContestVoteRecord CreateVote(int entryId, int? userId, VoteIdentity identity) => new()
    {
        ContestEntryId = entryId,
        UserId = userId,
        VoterIpOrEmail = identity.VoterIpOrEmail,
        VoterKey = identity.VoterKey,
        VotedAt = DateTime.UtcNow
    };

    private static VoteIdentity CreateVoteIdentity(
        int entryId,
        VoteContestEntryRequest request,
        int? userId,
        string guestVoteToken,
        DateTime contestEndDate)
    {
        var voterIdentifier = userId.HasValue
            ? $"member:{userId.Value}"
            : !string.IsNullOrWhiteSpace(request.GuestEmail)
                ? request.GuestEmail.Trim().ToLowerInvariant()
                : $"guest-token:{guestVoteToken}";
        var voterKey = userId.HasValue ? voterIdentifier : $"guest:{voterIdentifier.ToLowerInvariant()}";
        var voterIpOrEmail = userId.HasValue ? $"USER_{userId.Value}" : $"GUEST_{guestVoteToken}";
        var ttl = (int)Math.Clamp((contestEndDate.AddDays(30) - DateTime.UtcNow).TotalSeconds, 60d, 315360000d);
        return new VoteIdentity(voterKey, voterIpOrEmail, $"contest:vote:{entryId}:{RedisVoteGuard.Hash(voterKey)}", ttl);
    }

    private async Task ReleaseReservationAsync(VoteIdentity identity, bool? wasReserved, CancellationToken cancellationToken)
    {
        if (wasReserved != false)
        {
            await redisVoteGuard.ReleaseAsync(identity.RedisKey, cancellationToken);
        }
    }

    private static bool IsDuplicateVoteViolation(DbUpdateException exception) =>
        exception.InnerException is SqlException { Number: 2601 or 2627 };

    private sealed record VoteIdentity(string VoterKey, string VoterIpOrEmail, string RedisKey, int TtlSeconds);

    private static ContestEntryDto MapEntry(ContestEntryRecord entry, ContestRecord contest, bool includePrivateDetails = true) => new()
    {
        EntryId = entry.EntryId,
        ContestId = entry.ContestId,
        ContestTitle = contest.Title,
        ContestType = contest.ContestType,
        UserId = includePrivateDetails ? entry.UserId : null,
        SubmitterName = entry.SubmitterName,
        SubmitterEmail = includePrivateDetails ? entry.SubmitterEmail : string.Empty,
        IsGuest = entry.UserId is null,
        Title = entry.Title,
        Ingredients = entry.Ingredients,
        CookingProcedure = entry.CookingProcedure,
        TipContent = entry.TipContent,
        SubmittedAt = entry.SubmittedAt,
        IsWinner = entry.IsWinner,
        VoteCount = entry.VoteCount
    };

}
