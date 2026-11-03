using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// Announcement view DTO.
    /// </summary>
    public class AnnouncementDto
    {
        public int AnnouncementId { get; set; }
        public int? ContestId { get; set; }
        public string? ContestTitle { get; set; }
        public int? WinnerEntryId { get; set; }
        public string? WinnerTitle { get; set; }
        public string? WinnerName { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime PublishedAt { get; set; }
        public bool IsEmailSent { get; set; }
    }

    /// <summary>
    /// Request DTO for publishing an announcement (Admin only).
    /// </summary>
    public class CreateAnnouncementRequest
    {
        public int? ContestId { get; set; }

        public int? WinnerEntryId { get; set; }

        [Required(ErrorMessage = "Announcement title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Announcement content is required.")]
        public string Content { get; set; } = string.Empty;

        /// <summary>Whether to trigger automated emails upon publishing.</summary>
        public bool SendEmailNotification { get; set; } = true;
    }
}

