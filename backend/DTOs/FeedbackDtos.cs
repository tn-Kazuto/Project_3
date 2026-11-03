using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// Request DTO for submitting a feedback comment.
    /// Can be submitted on a specific recipe (RecipeId provided) or as general site feedback (RecipeId null).
    /// Both guests and registered users can submit feedback.
    /// </summary>
    public class CreateFeedbackRequest
    {
        /// <summary>
        /// Optional recipe ID. Null if this is general feedback for the website.
        /// </summary>
        public int? RecipeId { get; set; }

        /// <summary>
        /// Sender's full name. Required for guest users; auto-filled for logged-in members.
        /// </summary>
        [StringLength(100, ErrorMessage = "Sender name cannot exceed 100 characters.")]
        public string? SenderName { get; set; }

        /// <summary>
        /// Sender's email address. Required for guest users; auto-filled for logged-in members.
        /// </summary>
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(150)]
        public string? SenderEmail { get; set; }

        /// <summary>
        /// The feedback text / comment content.
        /// </summary>
        [Required(ErrorMessage = "Comment is required.")]
        public string Comment { get; set; } = string.Empty;

        /// <summary>Optional URL of user practice image or video demonstrating recipe execution.</summary>
        [StringLength(500, ErrorMessage = "Media URL cannot exceed 500 characters.")]
        public string? MediaUrl { get; set; }

        /// <summary>Optional star rating between 1 and 5.</summary>
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5 stars.")]
        public int? Rating { get; set; }
    }

    /// <summary>
    /// Feedback view DTO.
    /// </summary>
    public class FeedbackDto
    {
        public int FeedbackId { get; set; }
        public int? RecipeId { get; set; }
        public string? RecipeTitle { get; set; }
        public int? UserId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public string? MediaUrl { get; set; }
        public int? Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsGuest { get; set; }
    }
}

