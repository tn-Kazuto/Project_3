namespace JamesThew.Shared.Contracts.Events;

/// <summary>
/// Sự kiện phát sinh khi thanh toán gói thành viên thành công (Saga Participant)
/// </summary>
public record SubscriptionActivatedEvent(
    int UserId,
    string Email,
    string PlanType,
    decimal Amount,
    DateTime StartDate,
    DateTime EndDate,
    DateTime Timestamp
);

/// <summary>
/// Sự kiện khi gói hội viên hết hạn (chuyển trạng thái xuống Guest)
/// </summary>
public record SubscriptionExpiredEvent(
    int UserId,
    string Email,
    DateTime ExpiredAt
);

