using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    /// <summary>
    /// Represents a registered user of the James Thew Cooking Website.
    /// Users can be either Admins (site managers) or Members (subscribers).
    /// Members must have an active subscription to access premium content.
    /// </summary>
    public class User
    {
        /// <summary>Primary key. Auto-incremented user identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        /// <summary>Unique login name chosen by the user.</summary>
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        /// <summary>BCrypt-hashed password. Never stored in plain text.</summary>
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>User's full display name.</summary>
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        /// <summary>Unique email address used for account verification and notifications.</summary>
        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        /// <summary>Optional phone number for contact purposes.</summary>
        [MaxLength(20)]
        public string? Phone { get; set; }

        /// <summary>
        /// User role controlling access level.
        /// Valid values: "ADMIN" (full site management) or "MEMBER" (subscriber).
        /// </summary>
        [Required]
        [MaxLength(10)]
        public string Role { get; set; } = "MEMBER";

        /// <summary>
        /// Subscription tier for members. Null for Admin users.
        /// Valid values: "MONTHLY" or "YEARLY".
        /// </summary>
        [MaxLength(10)]
        public string? SubscriptionPlan { get; set; }

        /// <summary>
        /// Monetary amount paid for the current subscription period.
        /// 10.00 for MONTHLY, 100.00 for YEARLY. Null for Admin users.
        /// </summary>
        [Column(TypeName = "decimal(10,2)")]
        public decimal? SubscriptionAmount { get; set; }

        /// <summary>Date and time when the current subscription period began.</summary>
        public DateTime? SubscriptionStart { get; set; }

        /// <summary>Date and time when the current subscription period expires.</summary>
        public DateTime? SubscriptionEnd { get; set; }

        /// <summary>Timestamp of when the user account was created.</summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Optional URL pointing to user avatar image.</summary>
        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        /// <summary>Whether user's email has been verified.</summary>
        public bool IsEmailVerified { get; set; } = true;

        // ── Navigation Properties ──

        /// <summary>Recipes authored by this user.</summary>
        public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();

        /// <summary>Tips authored by this user.</summary>
        public ICollection<Tip> Tips { get; set; } = new List<Tip>();

        /// <summary>Payment transactions associated with this user's subscriptions.</summary>
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        /// <summary>Notifications delivered to this user.</summary>
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        /// <summary>Contest votes cast by this user.</summary>
        public ICollection<ContestVote> ContestVotes { get; set; } = new List<ContestVote>();
    }

    /// <summary>
    /// Records a subscription payment transaction for a member.
    /// Each payment corresponds to a MONTHLY or YEARLY subscription purchase.
    /// </summary>
    public class Payment
    {
        /// <summary>Primary key. Auto-incremented payment identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PaymentId { get; set; }

        /// <summary>Foreign key referencing the user who made this payment.</summary>
        [Required]
        public int UserId { get; set; }

        /// <summary>
        /// Subscription plan type purchased in this transaction.
        /// Valid values: "MONTHLY" or "YEARLY".
        /// </summary>
        [Required]
        [MaxLength(10)]
        public string PlanType { get; set; } = string.Empty;

        /// <summary>
        /// Payment amount in USD. Expected values: 10.00 (monthly) or 100.00 (yearly).
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        /// <summary>Date and time when the payment was processed.</summary>
        [Required]
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Current status of the payment transaction.
        /// Valid values: "COMPLETED", "PENDING", or "FAILED".
        /// </summary>
        [Required]
        [MaxLength(15)]
        public string Status { get; set; } = "PENDING";

        // ── Navigation Properties ──

        /// <summary>The user who made this payment.</summary>
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }

    /// <summary>
    /// Represents a recipe category used to organize recipes by cuisine or type.
    /// Examples: Italian, Desserts, Vegan, etc.
    /// </summary>
    public class Category
    {
        /// <summary>Primary key. Auto-incremented category identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CategoryId { get; set; }

        /// <summary>Display name of the category.</summary>
        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        /// <summary>Optional description explaining the category scope.</summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        // ── Navigation Properties ──

        /// <summary>Recipes that belong to this category.</summary>
        public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
    }

    /// <summary>
    /// Represents a cooking recipe published on the website.
    /// Recipes can be free (accessible to all) or premium (subscribers only).
    /// </summary>
    public class Recipe
    {
        /// <summary>Primary key. Auto-incremented recipe identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RecipeId { get; set; }

        /// <summary>Foreign key referencing the user who authored this recipe.</summary>
        [Required]
        public int AuthorId { get; set; }

        /// <summary>Foreign key referencing the category this recipe belongs to.</summary>
        [Required]
        public int CategoryId { get; set; }

        /// <summary>Title of the recipe.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Full list of ingredients required for the recipe.
        /// Stored as TEXT to accommodate lengthy ingredient lists.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Ingredients { get; set; } = string.Empty;

        /// <summary>
        /// Step-by-step cooking procedure / instructions.
        /// Stored as TEXT to accommodate detailed multi-step procedures.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string CookingProcedure { get; set; } = string.Empty;

        /// <summary>Optional URL pointing to an image of the finished dish.</summary>
        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Indicates whether the recipe is freely accessible.
        /// True = visible to everyone; False = premium (subscribers only).
        /// </summary>
        [Required]
        public bool IsFree { get; set; } = true;

        /// <summary>
        /// Content classification type according to SRS v2.0.
        /// Valid values: "ARTICLE", "VIDEO", "TALKSHOW", "LIVESHOW".
        /// Defaults to "ARTICLE".
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string ContentType { get; set; } = "ARTICLE";

        /// <summary>Optional URL pointing to an instructional video or broadcast stream.</summary>
        [MaxLength(500)]
        public string? VideoUrl { get; set; }

        /// <summary>Optional URL pointing to a thumbnail image for video/talkshow/liveshow.</summary>
        [MaxLength(500)]
        public string? ThumbnailUrl { get; set; }

        /// <summary>Number of times this recipe has been shared to Facebook or external networks.</summary>
        public int ShareCount { get; set; } = 0;

        /// <summary>Timestamp of when the recipe was first published.</summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Timestamp of the most recent edit. Null if never edited.</summary>
        public DateTime? UpdatedAt { get; set; }

        // ── Navigation Properties ──

        /// <summary>The user who authored this recipe.</summary>
        [ForeignKey("AuthorId")]
        public User Author { get; set; } = null!;

        /// <summary>The category this recipe belongs to.</summary>
        [ForeignKey("CategoryId")]
        public Category Category { get; set; } = null!;

        /// <summary>Feedback / comments left on this recipe.</summary>
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
    }

    /// <summary>
    /// Represents a cooking tip or advice article published on the website.
    /// Tips can be free (accessible to all) or premium (subscribers only).
    /// </summary>
    public class Tip
    {
        /// <summary>Primary key. Auto-incremented tip identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TipId { get; set; }

        /// <summary>Foreign key referencing the user who authored this tip.</summary>
        [Required]
        public int AuthorId { get; set; }

        /// <summary>Title of the tip.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Full content / body of the tip.
        /// Stored as TEXT to accommodate lengthy advice articles.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Indicates whether the tip is freely accessible.
        /// True = visible to everyone; False = premium (subscribers only).
        /// </summary>
        [Required]
        public bool IsFree { get; set; } = true;

        /// <summary>Optional URL pointing to an instructional video illustrating this tip.</summary>
        [MaxLength(500)]
        public string? VideoUrl { get; set; }

        /// <summary>Timestamp of when the tip was first published.</summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Timestamp of the most recent edit. Null if never edited.</summary>
        public DateTime? UpdatedAt { get; set; }

        // ── Navigation Properties ──

        /// <summary>The user who authored this tip.</summary>
        [ForeignKey("AuthorId")]
        public User Author { get; set; } = null!;
    }

    /// <summary>
    /// Represents a cooking contest hosted on the website.
    /// Contests can accept either recipe or tip submissions from members and guests.
    /// </summary>
    public class Contest
    {
        /// <summary>Primary key. Auto-incremented contest identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ContestId { get; set; }

        /// <summary>Title / name of the contest.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Detailed description of the contest rules and theme.
        /// Stored as TEXT to accommodate lengthy descriptions.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Type of submissions accepted by this contest.
        /// Valid values: "RECIPE" or "TIP".
        /// </summary>
        [Required]
        [MaxLength(10)]
        public string ContestType { get; set; } = string.Empty;

        /// <summary>Date and time when the contest opens for submissions.</summary>
        [Required]
        public DateTime StartDate { get; set; }

        /// <summary>Date and time when the contest closes for submissions.</summary>
        [Required]
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Whether the contest is currently active and visible on the site.
        /// Defaults to true upon creation.
        /// </summary>
        [Required]
        public bool IsActive { get; set; } = true;

        /// <summary>Foreign key referencing the admin user who created this contest.</summary>
        [Required]
        public int CreatedBy { get; set; }

        // ── Navigation Properties ──

        /// <summary>The admin user who created this contest.</summary>
        [ForeignKey("CreatedBy")]
        public User Creator { get; set; } = null!;

        /// <summary>All submissions / entries for this contest.</summary>
        public ICollection<ContestEntry> Entries { get; set; } = new List<ContestEntry>();

        /// <summary>Announcements associated with this contest (e.g., winner announcements).</summary>
        public ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
    }

    /// <summary>
    /// Represents a submission entry to a contest.
    /// Entries can be submitted by registered members or by guests (with name/email).
    /// Content fields vary depending on the contest type (RECIPE vs TIP).
    /// </summary>
    public class ContestEntry
    {
        /// <summary>Primary key. Auto-incremented entry identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EntryId { get; set; }

        /// <summary>Foreign key referencing the contest this entry belongs to.</summary>
        [Required]
        public int ContestId { get; set; }

        /// <summary>
        /// Foreign key referencing the registered user who submitted this entry.
        /// Null when the entry is submitted by a guest.
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>Display name of the guest submitter. Null for registered users.</summary>
        [MaxLength(100)]
        public string? GuestName { get; set; }

        /// <summary>Email of the guest submitter. Null for registered users.</summary>
        [MaxLength(150)]
        public string? GuestEmail { get; set; }

        /// <summary>Title of the contest entry submission.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Ingredients list for recipe-type contest entries.
        /// Null for tip-type contest entries.
        /// </summary>
        [Column(TypeName = "TEXT")]
        public string? Ingredients { get; set; }

        /// <summary>
        /// Cooking procedure for recipe-type contest entries.
        /// Null for tip-type contest entries.
        /// </summary>
        [Column(TypeName = "TEXT")]
        public string? CookingProcedure { get; set; }

        /// <summary>
        /// Tip content for tip-type contest entries.
        /// Null for recipe-type contest entries.
        /// </summary>
        [Column(TypeName = "TEXT")]
        public string? TipContent { get; set; }

        /// <summary>Timestamp of when the entry was submitted.</summary>
        [Required]
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Whether this entry has been selected as a winner of the contest.
        /// Defaults to false until the admin declares a winner.
        /// </summary>
        [Required]
        public bool IsWinner { get; set; } = false;

        /// <summary>Total community votes cast for this entry.</summary>
        public int VoteCount { get; set; } = 0;

        // ── Navigation Properties ──

        /// <summary>The contest this entry was submitted to.</summary>
        [ForeignKey("ContestId")]
        public Contest Contest { get; set; } = null!;

        /// <summary>
        /// The registered user who submitted this entry.
        /// Null when the entry was submitted by a guest.
        /// </summary>
        [ForeignKey("UserId")]
        public User? User { get; set; }

        /// <summary>Individual votes cast for this contest entry.</summary>
        public ICollection<ContestVote> Votes { get; set; } = new List<ContestVote>();
    }

    /// <summary>
    /// Represents a site-wide or contest-specific announcement.
    /// Used to publish contest winner declarations and general news.
    /// </summary>
    public class Announcement
    {
        /// <summary>Primary key. Auto-incremented announcement identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AnnouncementId { get; set; }

        /// <summary>
        /// Optional foreign key referencing the associated contest.
        /// Null for general (non-contest) announcements.
        /// </summary>
        public int? ContestId { get; set; }

        /// <summary>
        /// Optional foreign key referencing the winning contest entry.
        /// Null for non-winner announcements.
        /// </summary>
        public int? WinnerEntryId { get; set; }

        /// <summary>Title / headline of the announcement.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Full body content of the announcement.
        /// Stored as TEXT to accommodate lengthy content.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Content { get; set; } = string.Empty;

        /// <summary>Date and time when the announcement was published.</summary>
        [Required]
        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Indicates whether automated notifications / emails have been dispatched for this announcement.</summary>
        public bool IsEmailSent { get; set; } = false;

        // ── Navigation Properties ──

        /// <summary>
        /// The contest associated with this announcement, if any.
        /// Null for general announcements.
        /// </summary>
        [ForeignKey("ContestId")]
        public Contest? Contest { get; set; }

        /// <summary>
        /// The winning contest entry referenced by this announcement, if any.
        /// </summary>
        [ForeignKey("WinnerEntryId")]
        public ContestEntry? WinnerEntry { get; set; }
    }

    /// <summary>
    /// Represents feedback or a comment submitted on a recipe or the website in general.
    /// Feedback can come from registered users or anonymous guests.
    /// </summary>
    public class Feedback
    {
        /// <summary>Primary key. Auto-incremented feedback identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FeedbackId { get; set; }

        /// <summary>
        /// Optional foreign key referencing the recipe this feedback is about.
        /// Null for general website feedback not tied to a specific recipe.
        /// </summary>
        public int? RecipeId { get; set; }

        /// <summary>
        /// Optional foreign key referencing the registered user who left feedback.
        /// Null when feedback is submitted by a guest.
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>Name of the person who submitted the feedback.</summary>
        [Required]
        [MaxLength(100)]
        public string SenderName { get; set; } = string.Empty;

        /// <summary>Email of the person who submitted the feedback.</summary>
        [Required]
        [MaxLength(150)]
        public string SenderEmail { get; set; } = string.Empty;

        /// <summary>
        /// The feedback comment / message body.
        /// Stored as TEXT to accommodate lengthy comments.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Comment { get; set; } = string.Empty;

        /// <summary>Optional URL pointing to user practice image/video demonstrating recipe results.</summary>
        [MaxLength(500)]
        public string? MediaUrl { get; set; }

        /// <summary>Optional star rating for the recipe (1 to 5 stars).</summary>
        public int? Rating { get; set; }

        /// <summary>Timestamp of when the feedback was submitted.</summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──

        /// <summary>
        /// The recipe this feedback is associated with, if any.
        /// Null for general website feedback.
        /// </summary>
        [ForeignKey("RecipeId")]
        public Recipe? Recipe { get; set; }

        /// <summary>
        /// The registered user who submitted this feedback, if any.
        /// Null for guest feedback.
        /// </summary>
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }

    /// <summary>
    /// Represents a Frequently Asked Question displayed on the website.
    /// FAQs are ordered by DisplayOrder for consistent presentation.
    /// </summary>
    public class Faq
    {
        /// <summary>Primary key. Auto-incremented FAQ identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FaqId { get; set; }

        /// <summary>The question text displayed to users.</summary>
        [Required]
        [MaxLength(500)]
        public string Question { get; set; } = string.Empty;

        /// <summary>
        /// The answer text displayed when the question is expanded.
        /// Stored as TEXT to accommodate detailed answers.
        /// </summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Answer { get; set; } = string.Empty;

        /// <summary>
        /// Sort order for displaying FAQs on the page.
        /// Lower values appear first.
        /// </summary>
        [Required]
        public int DisplayOrder { get; set; }
    }

    /// <summary>
    /// Represents a community vote cast for a contest entry.
    /// Supports authenticated members and guests with IP/email fraud-prevention tracking.
    /// </summary>
    public class ContestVote
    {
        /// <summary>Primary key. Auto-incremented vote identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int VoteId { get; set; }

        /// <summary>Foreign key referencing the contest entry being voted for.</summary>
        [Required]
        public int ContestEntryId { get; set; }

        /// <summary>
        /// Foreign key referencing the registered user who voted.
        /// Null when vote is cast by a guest.
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>
        /// Voter's email or IP address for fraud detection and duplicate-prevention.
        /// </summary>
        [Required]
        [MaxLength(150)]
        public string VoterIpOrEmail { get; set; } = string.Empty;

        /// <summary>Timestamp of when the vote was cast.</summary>
        [Required]
        public DateTime VotedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──

        /// <summary>The contest entry that received this vote.</summary>
        [ForeignKey("ContestEntryId")]
        public ContestEntry ContestEntry { get; set; } = null!;

        /// <summary>The registered user who cast this vote, if authenticated.</summary>
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }

    /// <summary>
    /// Represents an in-app notification delivered to a user's notification bell.
    /// Triggers for contest announcements, new recipes, liveshows, and subscription renewals.
    /// </summary>
    public class Notification
    {
        /// <summary>Primary key. Auto-incremented notification identifier.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NotificationId { get; set; }

        /// <summary>Foreign key referencing the recipient user.</summary>
        [Required]
        public int UserId { get; set; }

        /// <summary>Headline / title of the notification.</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>Detailed message body.</summary>
        [Required]
        [Column(TypeName = "TEXT")]
        public string Message { get; set; } = string.Empty;

        /// <summary>Optional relative or absolute link for in-app navigation upon clicking.</summary>
        [MaxLength(500)]
        public string? TargetUrl { get; set; }

        /// <summary>Whether the notification has been read by the user.</summary>
        [Required]
        public bool IsRead { get; set; } = false;

        /// <summary>Timestamp of when the notification was created.</summary>
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──

        /// <summary>The recipient user of this notification.</summary>
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}
