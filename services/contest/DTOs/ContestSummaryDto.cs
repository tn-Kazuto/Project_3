namespace JamesThew.ContestService.DTOs;

public sealed class ContestSummaryDto
{
    public int TotalContests { get; set; }
    public int ActiveContests { get; set; }
    public int TotalSubmissions { get; set; }
}
