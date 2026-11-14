using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    /// <summary>
    /// Feedback business logic implementation.
    /// Per SRS:
    /// - Both registered members and guests can post feedbacks for recipes or the website.
    /// - Admin can view all feedbacks received across the website.
    /// </summary>
    public class FeedbackService : IFeedbackService
    {
        private readonly IUnitOfWork _uow;

        public FeedbackService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<ApiResponse<FeedbackDto>> CreateAsync(
            CreateFeedbackRequest request, int? currentUserId)
        {
            Recipe? recipe = null;
            if (request.RecipeId.HasValue)
            {
                recipe = await _uow.Repository<Recipe>().GetByIdAsync(request.RecipeId.Value);
                if (recipe == null)
                {
                    return ApiResponse<FeedbackDto>.Fail("Associated recipe not found.");
                }
            }

            string senderName;
            string senderEmail;

            if (currentUserId.HasValue)
            {
                var user = await _uow.Repository<User>().GetByIdAsync(currentUserId.Value);
                if (user == null)
                {
                    return ApiResponse<FeedbackDto>.Fail("Authenticated user not found.");
                }

                senderName = !string.IsNullOrWhiteSpace(request.SenderName)
                    ? request.SenderName.Trim()
                    : user.FullName;

                senderEmail = !string.IsNullOrWhiteSpace(request.SenderEmail)
                    ? request.SenderEmail.Trim().ToLowerInvariant()
                    : user.Email;
            }
            else
            {
                // Guest submission requires explicit sender name and email
                if (string.IsNullOrWhiteSpace(request.SenderName))
                {
                    return ApiResponse<FeedbackDto>.Fail("Name is required when submitting feedback as a guest.");
                }

                if (string.IsNullOrWhiteSpace(request.SenderEmail))
                {
                    return ApiResponse<FeedbackDto>.Fail("Email is required when submitting feedback as a guest.");
                }

                senderName = request.SenderName.Trim();
                senderEmail = request.SenderEmail.Trim().ToLowerInvariant();
            }

            var feedback = new Feedback
            {
                RecipeId = request.RecipeId,
                UserId = currentUserId,
                SenderName = senderName,
                SenderEmail = senderEmail,
                Comment = request.Comment.Trim(),
                MediaUrl = request.MediaUrl?.Trim(),
                Rating = request.Rating,
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Repository<Feedback>().AddAsync(feedback);
            await _uow.SaveChangesAsync();

            var dto = new FeedbackDto
            {
                FeedbackId = feedback.FeedbackId,
                RecipeId = feedback.RecipeId,
                RecipeTitle = recipe?.Title,
                UserId = feedback.UserId,
                SenderName = feedback.SenderName,
                SenderEmail = feedback.SenderEmail,
                Comment = feedback.Comment,
                MediaUrl = feedback.MediaUrl,
                Rating = feedback.Rating,
                CreatedAt = feedback.CreatedAt,
                IsGuest = feedback.UserId == null
            };

            return ApiResponse<FeedbackDto>.Ok(dto, "Feedback submitted successfully. Thank you!");
        }

        public async Task<ApiResponse<IEnumerable<FeedbackDto>>> GetByRecipeIdAsync(int recipeId)
        {
            var feedbacks = await _uow.Repository<Feedback>().QueryReadOnly()
                .Include(f => f.Recipe)
                .Where(f => f.RecipeId == recipeId)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackDto
                {
                    FeedbackId = f.FeedbackId,
                    RecipeId = f.RecipeId,
                    RecipeTitle = f.Recipe != null ? f.Recipe.Title : null,
                    UserId = f.UserId,
                    SenderName = f.SenderName,
                    SenderEmail = f.SenderEmail,
                    Comment = f.Comment,
                    MediaUrl = f.MediaUrl,
                    Rating = f.Rating,
                    CreatedAt = f.CreatedAt,
                    IsGuest = f.UserId == null
                })
                .ToListAsync();

            return ApiResponse<IEnumerable<FeedbackDto>>.Ok(feedbacks);
        }

        public async Task<ApiResponse<IEnumerable<FeedbackDto>>> GetAllAsync()
        {
            var feedbacks = await _uow.Repository<Feedback>().QueryReadOnly()
                .Include(f => f.Recipe)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackDto
                {
                    FeedbackId = f.FeedbackId,
                    RecipeId = f.RecipeId,
                    RecipeTitle = f.Recipe != null ? f.Recipe.Title : null,
                    UserId = f.UserId,
                    SenderName = f.SenderName,
                    SenderEmail = f.SenderEmail,
                    Comment = f.Comment,
                    MediaUrl = f.MediaUrl,
                    Rating = f.Rating,
                    CreatedAt = f.CreatedAt,
                    IsGuest = f.UserId == null
                })
                .ToListAsync();

            return ApiResponse<IEnumerable<FeedbackDto>>.Ok(feedbacks);
        }

        public async Task<ApiResponse> DeleteAsync(int id)
        {
            var repo = _uow.Repository<Feedback>();
            var feedback = await repo.GetByIdAsync(id);
            if (feedback == null)
            {
                return ApiResponse.Fail("Feedback entry not found.");
            }

            repo.Remove(feedback);
            await _uow.SaveChangesAsync();
            return ApiResponse.Ok("Feedback deleted successfully.");
        }
    }
}

