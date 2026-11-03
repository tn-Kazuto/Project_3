namespace backend.DTOs
{
    /// <summary>
    /// FAQ view DTO representing one of the 7 mandatory frequently asked questions.
    /// </summary>
    public class FaqDto
    {
        public int FaqId { get; set; }
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
    }
}

