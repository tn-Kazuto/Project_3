using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// Contest view DTO.
    /// </summary>
    public class ContestDto
    {
        public int ContestId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ContestType { get; set; } = string.Empty; // "RECIPE" or "TIP"
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public int EntryCount { get; set; }
    }

    /// <summary>
    /// Request DTO for creating a new contest (Admin only).
    /// </summary>
    public class CreateContestRequest
    {
        [Required(ErrorMessage = "Contest title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contest description and rules are required.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contest type is required (RECIPE or TIP).")]
        public string ContestType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Start date is required.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "End date is required.")]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// Request DTO for submitting a contest entry.
    /// Supported for both registered users and unauthenticated guests.
    /// </summary>
    public class SubmitEntryRequest
    {
        [Required(ErrorMessage = "Submission title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        /// <summary>Ingredients list (required if contest is RECIPE type).</summary>
        public string? Ingredients { get; set; }

        /// <summary>Cooking procedure (required if contest is RECIPE type).</summary>
        public string? CookingProcedure { get; set; }

        /// <summary>Tip content (required if contest is TIP type).</summary>
        public string? TipContent { get; set; }

        /// <summary>Full name of the submitter. Required if submitted as a guest.</summary>
        public string? GuestName { get; set; }

        /// <summary>Email of the submitter. Required if submitted as a guest.</summary>
        [EmailAddress(ErrorMessage = "Invalid guest email format.")]
        public string? GuestEmail { get; set; }
    }

    /// <summary>
    /// View DTO for a contest entry.
    /// </summary>
    public class ContestEntryDto
    {
        public int EntryId { get; set; }
        public int ContestId { get; set; }
        public string ContestTitle { get; set; } = string.Empty;
        public string ContestType { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public string SubmitterName { get; set; } = string.Empty;
        public string SubmitterEmail { get; set; } = string.Empty;
        public bool IsGuest { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Ingredients { get; set; }
        public string? CookingProcedure { get; set; }
        public string? TipContent { get; set; }
        public DateTime SubmittedAt { get; set; }
        public bool IsWinner { get; set; }
        public int VoteCount { get; set; }
        public bool HasUserVoted { get; set; }
    }

    /// <summary>
    /// Request DTO for voting on a contest entry.
    /// </summary>
    public class VoteContestEntryRequest
    {
        /// <summary>Optional guest email or identifier if unauthenticated.</summary>
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string? GuestEmail { get; set; }
    }

    /// <summary>
    /// Result DTO for a contest voting action.
    /// </summary>
    public class ContestVoteResultDto
    {
        public int EntryId { get; set; }
        public int NewVoteCount { get; set; }
        public bool HasVoted { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}

