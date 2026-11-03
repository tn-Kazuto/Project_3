using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// Cooking tip view DTO.
    /// </summary>
    public class TipDto
    {
        public int TipId { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsFree { get; set; }
        public string? VideoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Request DTO for creating a new cooking tip.
    /// </summary>
    public class CreateTipRequest
    {
        [Required(ErrorMessage = "Tip title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tip content is required.")]
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Controls whether the tip is accessible to guest users.
        /// Admin can choose free or members-only; Members default to false (members-only).
        /// </summary>
        public bool IsFree { get; set; } = false;

        [StringLength(500, ErrorMessage = "Video URL cannot exceed 500 characters.")]
        public string? VideoUrl { get; set; }
    }

    /// <summary>
    /// Request DTO for updating an existing cooking tip.
    /// </summary>
    public class UpdateTipRequest
    {
        [Required(ErrorMessage = "Tip title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tip content is required.")]
        public string Content { get; set; } = string.Empty;

        public bool IsFree { get; set; } = false;

        [StringLength(500, ErrorMessage = "Video URL cannot exceed 500 characters.")]
        public string? VideoUrl { get; set; }
    }
}

