using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    /// <summary>
    /// Contest business logic implementation supporting guest/member submissions and winner declarations.
    /// Per SRS:
    /// - Admin can post new contests and delete contests.
    /// - Both registered members and non-registered general users (guests) can view and participate in contests.
    /// - For general users, GuestName and GuestEmail must be captured so the owner can contact them if they win.
    /// - Admin can view all entries for a contest and declare winners.
    /// </summary>
    public class ContestService : IContestService
    {
        private readonly IUnitOfWork _uow;
        private readonly INotificationService? _notificationService;
        private readonly IEmailService? _emailService;

        public ContestService(
            IUnitOfWork uow,
            INotificationService? notificationService = null,
            IEmailService? emailService = null)
        {
            _uow = uow;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        public async Task<ApiResponse<IEnumerable<ContestDto>>> GetAllAsync(bool? activeOnly = null)
        {
            var query = _uow.Repository<Contest>().Query()
                .Include(c => c.Creator)
                .Include(c => c.Entries)
                .AsQueryable();

            if (activeOnly.HasValue && activeOnly.Value)
            {
                var now = DateTime.UtcNow;
                query = query.Where(c => c.IsActive && c.EndDate >= now);
            }

            var contests = await query
                .OrderByDescending(c => c.StartDate)
                .Select(c => MapToDto(c))
                .ToListAsync();

            return ApiResponse<IEnumerable<ContestDto>>.Ok(contests);
        }

        public async Task<ApiResponse<ContestDto>> GetByIdAsync(int id)
        {
            var contest = await _uow.Repository<Contest>().Query()
                .Include(c => c.Creator)
                .Include(c => c.Entries)
                .FirstOrDefaultAsync(c => c.ContestId == id);

            if (contest == null)
            {
                return ApiResponse<ContestDto>.Fail("Contest not found.");
            }

            return ApiResponse<ContestDto>.Ok(MapToDto(contest));
        }

        public async Task<ApiResponse<ContestDto>> CreateAsync(CreateContestRequest request, int adminId)
        {
            var typeUpper = request.ContestType.Trim().ToUpperInvariant();
            if (typeUpper != "RECIPE" && typeUpper != "TIP")
            {
                return ApiResponse<ContestDto>.Fail("Invalid contest type. Allowed values: 'RECIPE' or 'TIP'.");
            }

            if (request.EndDate <= request.StartDate)
            {
                return ApiResponse<ContestDto>.Fail("End date must be later than start date.");
            }

            var contest = new Contest
            {
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                ContestType = typeUpper,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                IsActive = request.IsActive,
                CreatedBy = adminId
            };

            await _uow.Repository<Contest>().AddAsync(contest);
            await _uow.SaveChangesAsync();

            return await GetByIdAsync(contest.ContestId);
        }

        public async Task<ApiResponse> DeleteAsync(int id)
        {
            var contest = await _uow.Repository<Contest>().GetByIdAsync(id);
            if (contest == null)
            {
                return ApiResponse.Fail("Contest not found.");
            }

            _uow.Repository<Contest>().Remove(contest);
            await _uow.SaveChangesAsync();

            return ApiResponse.Ok("Contest deleted successfully.");
        }

        public async Task<ApiResponse<ContestEntryDto>> SubmitEntryAsync(
            int contestId, SubmitEntryRequest request, int? currentUserId)
        {
            var contest = await _uow.Repository<Contest>().GetByIdAsync(contestId);
            if (contest == null)
            {
                return ApiResponse<ContestEntryDto>.Fail("Contest not found.");
            }

            if (!contest.IsActive || contest.EndDate < DateTime.UtcNow)
            {
                return ApiResponse<ContestEntryDto>.Fail("This contest is closed and no longer accepting submissions.");
            }

            // 1. Guest validation: If user is not logged in, GuestName and GuestEmail are mandatory
            if (currentUserId == null)
            {
                if (string.IsNullOrWhiteSpace(request.GuestName))
                {
                    return ApiResponse<ContestEntryDto>.Fail("Guest submitters must provide their full name.");
                }

                if (string.IsNullOrWhiteSpace(request.GuestEmail))
                {
                    return ApiResponse<ContestEntryDto>.Fail("Guest submitters must provide a valid email address.");
                }
            }

            // 2. Contest type validation
            if (contest.ContestType == "RECIPE")
            {
                if (string.IsNullOrWhiteSpace(request.Ingredients))
                {
                    return ApiResponse<ContestEntryDto>.Fail("Recipe submissions must include the ingredients list.");
                }
                if (string.IsNullOrWhiteSpace(request.CookingProcedure))
                {
                    return ApiResponse<ContestEntryDto>.Fail("Recipe submissions must include the cooking procedure.");
                }
            }
            else if (contest.ContestType == "TIP")
            {
                if (string.IsNullOrWhiteSpace(request.TipContent))
                {
                    return ApiResponse<ContestEntryDto>.Fail("Tip submissions must include the tip content.");
                }
            }

            var entry = new ContestEntry
            {
                ContestId = contestId,
                UserId = currentUserId,
                GuestName = currentUserId == null ? request.GuestName?.Trim() : null,
                GuestEmail = currentUserId == null ? request.GuestEmail?.Trim().ToLowerInvariant() : null,
                Title = request.Title.Trim(),
                Ingredients = contest.ContestType == "RECIPE" ? request.Ingredients?.Trim() : null,
                CookingProcedure = contest.ContestType == "RECIPE" ? request.CookingProcedure?.Trim() : null,
                TipContent = contest.ContestType == "TIP" ? request.TipContent?.Trim() : null,
                SubmittedAt = DateTime.UtcNow,
                IsWinner = false
            };

            await _uow.Repository<ContestEntry>().AddAsync(entry);
            await _uow.SaveChangesAsync();

            // Fetch with relations for returning DTO
            var created = await _uow.Repository<ContestEntry>().Query()
                .Include(e => e.Contest)
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.EntryId == entry.EntryId);

            return ApiResponse<ContestEntryDto>.Ok(
                MapEntryToDto(created!), "Contest entry submitted successfully!");
        }

        public async Task<ApiResponse<IEnumerable<ContestEntryDto>>> GetEntriesByContestAsync(
            int contestId, int? currentUserId = null, string? clientIp = null, bool? orderByVotes = null)
        {
            var contestExists = await _uow.Repository<Contest>().AnyAsync(c => c.ContestId == contestId);
            if (!contestExists)
            {
                return ApiResponse<IEnumerable<ContestEntryDto>>.Fail("Contest not found.");
            }

            var query = _uow.Repository<ContestEntry>().Query()
                .Include(e => e.Contest)
                .Include(e => e.User)
                .Include(e => e.Votes)
                .Where(e => e.ContestId == contestId)
                .AsQueryable();

            if (orderByVotes.HasValue && orderByVotes.Value)
            {
                query = query.OrderByDescending(e => e.VoteCount).ThenByDescending(e => e.SubmittedAt);
            }
            else
            {
                query = query.OrderByDescending(e => e.SubmittedAt);
            }

            var entries = await query.ToListAsync();

            string? voterIdentifier = currentUserId.HasValue 
                ? $"USER_{currentUserId.Value}" 
                : (clientIp != null ? $"IP_{clientIp}" : null);

            var dtos = entries.Select(e =>
            {
                var dto = MapEntryToDto(e);
                dto.HasUserVoted = e.Votes != null && e.Votes.Any(v =>
                    (currentUserId.HasValue && v.UserId == currentUserId.Value) ||
                    (voterIdentifier != null && v.VoterIpOrEmail == voterIdentifier));
                return dto;
            }).ToList();

            return ApiResponse<IEnumerable<ContestEntryDto>>.Ok(dtos);
        }

        public async Task<ApiResponse<ContestVoteResultDto>> VoteEntryAsync(
            int entryId, VoteContestEntryRequest request, int? currentUserId, string clientIp)
        {
            var entry = await _uow.Repository<ContestEntry>().Query()
                .Include(e => e.Contest)
                .FirstOrDefaultAsync(e => e.EntryId == entryId);

            if (entry == null)
            {
                return ApiResponse<ContestVoteResultDto>.Fail("Contest entry not found.");
            }

            if (entry.Contest == null || !entry.Contest.IsActive || entry.Contest.EndDate < DateTime.UtcNow)
            {
                return ApiResponse<ContestVoteResultDto>.Fail("Voting is closed for this contest.");
            }

            // Anti-fraud check: 
            // For authenticated members, check by UserId
            // For guest voters, check by GuestEmail or clientIp
            string voterIpOrEmail = currentUserId.HasValue
                ? $"USER_{currentUserId.Value}"
                : (!string.IsNullOrWhiteSpace(request.GuestEmail) 
                    ? request.GuestEmail.Trim().ToLowerInvariant() 
                    : $"IP_{clientIp}");

            var voteRepo = _uow.Repository<ContestVote>();
            bool alreadyVoted = await voteRepo.AnyAsync(v => 
                v.ContestEntryId == entryId && 
                ((currentUserId.HasValue && v.UserId == currentUserId.Value) || 
                 v.VoterIpOrEmail == voterIpOrEmail));

            if (alreadyVoted)
            {
                return ApiResponse<ContestVoteResultDto>.Fail("You have already voted for this culinary entry.");
            }

            var vote = new ContestVote
            {
                ContestEntryId = entryId,
                UserId = currentUserId,
                VoterIpOrEmail = voterIpOrEmail,
                VotedAt = DateTime.UtcNow
            };

            await voteRepo.AddAsync(vote);

            entry.VoteCount++;
            _uow.Repository<ContestEntry>().Update(entry);
            await _uow.SaveChangesAsync();

            return ApiResponse<ContestVoteResultDto>.Ok(new ContestVoteResultDto
            {
                EntryId = entryId,
                NewVoteCount = entry.VoteCount,
                HasVoted = true,
                Message = "Your vote has been successfully recorded. Thank you for supporting community creations!"
            });
        }

        public async Task<ApiResponse<ContestEntryDto>> SelectWinnerAsync(int entryId)
        {
            var entry = await _uow.Repository<ContestEntry>().Query()
                .Include(e => e.Contest)
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.EntryId == entryId);

            if (entry == null)
            {
                return ApiResponse<ContestEntryDto>.Fail("Contest entry not found.");
            }

            entry.IsWinner = true;
            _uow.Repository<ContestEntry>().Update(entry);

            // Auto-publish winner announcement if not already present
            var announcementRepo = _uow.Repository<Announcement>();
            bool announcementExists = await announcementRepo.AnyAsync(a => a.WinnerEntryId == entryId);
            if (!announcementExists)
            {
                string submitterName = entry.UserId == null
                    ? (entry.GuestName ?? "Guest Contender")
                    : (entry.User?.FullName ?? entry.User?.Username ?? "Member Chef");

                var announcement = new Announcement
                {
                    ContestId = entry.ContestId,
                    WinnerEntryId = entry.EntryId,
                    Title = $"Champion Crowned: {entry.Title} in {entry.Contest?.Title ?? "Culinary Contest"}",
                    Content = $"Chef James Thew proudly declares {submitterName} the winner of {entry.Contest?.Title ?? "the competition"} with their exceptional creation '{entry.Title}'. Congratulations on this prestigious honor!",
                    PublishedAt = DateTime.UtcNow
                };

                await announcementRepo.AddAsync(announcement);
            }

            await _uow.SaveChangesAsync();

            // Trigger Winner Email & Notifications (Phase U5)
            try
            {
                string submitterName = entry.UserId == null
                    ? (entry.GuestName ?? "Guest Contender")
                    : (entry.User?.FullName ?? entry.User?.Username ?? "Member Chef");

                string? recipientEmail = entry.UserId != null ? entry.User?.Email : entry.GuestEmail;

                if (_emailService != null && !string.IsNullOrWhiteSpace(recipientEmail))
                {
                    _ = _emailService.SendContestWinnerAnnouncementEmailAsync(
                        recipientEmail,
                        submitterName,
                        entry.Contest?.Title ?? "Culinary Contest",
                        entry.Title);
                }

                if (_notificationService != null)
                {
                    if (entry.UserId.HasValue)
                    {
                        await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                        {
                            UserId = entry.UserId.Value,
                            Title = "Grand Champion Honors!",
                            Message = $"Chef James Thew has officially awarded the Champion Title to your culinary dish '{entry.Title}'!",
                            TargetUrl = "/announcements"
                        });
                    }

                    await _notificationService.BroadcastNotificationAsync(
                        $"Winner Crowned: {entry.Contest?.Title ?? "Culinary Contest"}",
                        $"Chef James Thew has crowned {submitterName} the grand winner with '{entry.Title}'!",
                        "/announcements");
                }
            }
            catch
            {
                // Non-blocking notification/email dispatch
            }

            return ApiResponse<ContestEntryDto>.Ok(MapEntryToDto(entry), "Contest winner declared successfully.");
        }

        private static ContestDto MapToDto(Contest c)
        {
            return new ContestDto
            {
                ContestId = c.ContestId,
                Title = c.Title,
                Description = c.Description,
                ContestType = c.ContestType,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                IsActive = c.IsActive,
                CreatedBy = c.CreatedBy,
                CreatorName = c.Creator?.FullName ?? "Mr. James Thew",
                EntryCount = c.Entries?.Count ?? 0
            };
        }

        private static ContestEntryDto MapEntryToDto(ContestEntry e)
        {
            bool isGuest = e.UserId == null;
            string name = isGuest ? (e.GuestName ?? "Guest") : (e.User?.FullName ?? e.User?.Username ?? "Member");
            string email = isGuest ? (e.GuestEmail ?? "") : (e.User?.Email ?? "");

            return new ContestEntryDto
            {
                EntryId = e.EntryId,
                ContestId = e.ContestId,
                ContestTitle = e.Contest?.Title ?? string.Empty,
                ContestType = e.Contest?.ContestType ?? string.Empty,
                UserId = e.UserId,
                SubmitterName = name,
                SubmitterEmail = email,
                IsGuest = isGuest,
                Title = e.Title,
                Ingredients = e.Ingredients,
                CookingProcedure = e.CookingProcedure,
                TipContent = e.TipContent,
                SubmittedAt = e.SubmittedAt,
                IsWinner = e.IsWinner,
                VoteCount = e.VoteCount,
                HasUserVoted = false
            };
        }
    }
}

