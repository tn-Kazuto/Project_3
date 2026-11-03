namespace JamesThew.Shared.Contracts.Events;

/// <summary>
/// Sự kiện công bố quán quân cuộc thi ẩm thực do Chef James Thew phê duyệt
/// </summary>
public record ContestWinnerAnnouncedEvent(
    int ContestId,
    string ContestTitle,
    int WinnerEntryId,
    string WinnerName,
    string WinnerEmail,
    string PrizeDetails,
    string? AdminComment,
    DateTime PublishedAt
);

/// <summary>
/// Sự kiện bình chọn bài thi mới (để cập nhật real-time leaderboard)
/// </summary>
public record ContestVoteCastedEvent(
    int ContestId,
    int EntryId,
    int TotalVotes,
    DateTime VotedAt
);

