namespace JamesThew.Shared.Contracts.DTOs.Common;

/// <summary>
/// Chuẩn hóa kết quả phân trang theo yêu cầu PERF-09 (tối đa 50 mục/trang)
/// </summary>
/// <typeparam name="T">Kiểu phần tử</typeparam>
public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    public bool HasPreviousPage => PageIndex > 1;
    public bool HasNextPage => PageIndex < TotalPages;
}

