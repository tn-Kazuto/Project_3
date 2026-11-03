namespace JamesThew.Shared.Contracts.DTOs.Common;

/// <summary>
/// Chuẩn hóa định dạng phản hồi JSON API của hệ sinh thái James Thew
/// </summary>
/// <typeparam name="T">Kiểu dữ liệu của payload</typeparam>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> Ok(T data, string message = "Success") =>
        new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message) =>
        new() { Success = false, Message = message, Data = default };
}

