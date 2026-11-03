using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using backend.Services.EventBus;
using JamesThew.Shared.Contracts.Events;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    /// <summary>
    /// Announcement business logic implementation.
    /// Per SRS:
    /// - Admin publishes contest winner announcements.
    /// - All users (including non-members) can view announcements to see contest winners.
    /// </summary>
    public class AnnouncementService : IAnnouncementService
    {
        private readonly IUnitOfWork _uow;
        private readonly IEventBus? _eventBus;

        public AnnouncementService(IUnitOfWork uow, IEventBus? eventBus = null)
        {
            _uow = uow;
            _eventBus = eventBus;
        }

        public async Task<ApiResponse<IEnumerable<AnnouncementDto>>> GetAllAsync()
        {
            var announcements = await _uow.Repository<Announcement>().Query()
                .Include(a => a.Contest)
                .Include(a => a.WinnerEntry)
                    .ThenInclude(w => w!.User)
                .OrderByDescending(a => a.PublishedAt)
                .Select(a => MapToDto(a))
                .ToListAsync();

            return ApiResponse<IEnumerable<AnnouncementDto>>.Ok(announcements);
        }

        public async Task<ApiResponse<AnnouncementDto>> GetByIdAsync(int id)
        {
            var announcement = await _uow.Repository<Announcement>().Query()
                .Include(a => a.Contest)
                .Include(a => a.WinnerEntry)
                    .ThenInclude(w => w!.User)
                .FirstOrDefaultAsync(a => a.AnnouncementId == id);

            if (announcement == null)
            {
                return ApiResponse<AnnouncementDto>.Fail("Announcement not found.");
            }

            return ApiResponse<AnnouncementDto>.Ok(MapToDto(announcement));
        }

        public async Task<ApiResponse<AnnouncementDto>> CreateAsync(CreateAnnouncementRequest request)
        {
            if (request.ContestId.HasValue)
            {
                var contestExists = await _uow.Repository<Contest>()
                    .AnyAsync(c => c.ContestId == request.ContestId.Value);
                if (!contestExists)
                {
                    return ApiResponse<AnnouncementDto>.Fail("Associated contest not found.");
                }
            }

            if (request.WinnerEntryId.HasValue)
            {
                var entryExists = await _uow.Repository<ContestEntry>()
                    .AnyAsync(e => e.EntryId == request.WinnerEntryId.Value);
                if (!entryExists)
                {
                    return ApiResponse<AnnouncementDto>.Fail("Associated winner entry not found.");
                }
            }

            var announcement = new Announcement
            {
                ContestId = request.ContestId,
                WinnerEntryId = request.WinnerEntryId,
                Title = request.Title.Trim(),
                Content = request.Content.Trim(),
                PublishedAt = DateTime.UtcNow
            };

            await _uow.Repository<Announcement>().AddAsync(announcement);
            await _uow.SaveChangesAsync();

            // Publish ContestWinnerAnnouncedEvent to RabbitMQ
            if (_eventBus != null && request.WinnerEntryId.HasValue)
            {
                try
                {
                    var entry = await _uow.Repository<ContestEntry>().Query()
                        .Include(e => e.User)
                        .Include(e => e.Contest)
                        .FirstOrDefaultAsync(e => e.EntryId == request.WinnerEntryId.Value);

                    if (entry != null)
                    {
                        var winnerName = entry.UserId != null
                            ? (entry.User?.FullName ?? entry.User?.Username ?? "Member")
                            : (entry.GuestName ?? "Guest");
                        var winnerEmail = entry.UserId != null
                            ? (entry.User?.Email ?? "")
                            : (entry.GuestEmail ?? "");

                        _ = _eventBus.PublishAsync(
                            "jamesthew.events",
                            "contest.announced",
                            new ContestWinnerAnnouncedEvent(
                                entry.ContestId,
                                entry.Contest?.Title ?? announcement.Title,
                                entry.EntryId,
                                winnerName,
                                winnerEmail,
                                "Official Grand Champion Prize",
                                announcement.Content,
                                announcement.PublishedAt
                            ));
                    }
                }
                catch
                {
                    // Non-blocking event publish
                }
            }

            return await GetByIdAsync(announcement.AnnouncementId);
        }

        public async Task<ApiResponse> DeleteAsync(int id)
        {
            var announcement = await _uow.Repository<Announcement>().GetByIdAsync(id);
            if (announcement == null)
            {
                return ApiResponse.Fail("Announcement not found.");
            }

            _uow.Repository<Announcement>().Remove(announcement);
            await _uow.SaveChangesAsync();

            return ApiResponse.Ok("Announcement deleted successfully.");
        }

        private static AnnouncementDto MapToDto(Announcement a)
        {
            string? winnerName = null;
            if (a.WinnerEntry != null)
            {
                winnerName = a.WinnerEntry.UserId != null
                    ? (a.WinnerEntry.User?.FullName ?? a.WinnerEntry.User?.Username)
                    : a.WinnerEntry.GuestName;
            }

            return new AnnouncementDto
            {
                AnnouncementId = a.AnnouncementId,
                ContestId = a.ContestId,
                ContestTitle = a.Contest?.Title,
                WinnerEntryId = a.WinnerEntryId,
                WinnerTitle = a.WinnerEntry?.Title,
                WinnerName = winnerName,
                Title = a.Title,
                Content = a.Content,
                PublishedAt = a.PublishedAt,
                IsEmailSent = a.IsEmailSent
            };
        }
    }
}

