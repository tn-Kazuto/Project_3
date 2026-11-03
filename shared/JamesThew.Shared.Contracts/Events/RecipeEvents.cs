namespace JamesThew.Shared.Contracts.Events;

/// <summary>
/// Sự kiện khi công thức mới được xuất bản (kích hoạt thông báo độc giả)
/// </summary>
public record RecipePublishedEvent(
    int RecipeId,
    string Title,
    string CategoryName,
    bool IsFree,
    string ContentType,
    int AuthorId,
    DateTime PublishedAt
);

