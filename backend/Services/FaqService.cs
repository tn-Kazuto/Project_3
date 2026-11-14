using backend.DTOs;
using backend.Entities;
using backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    /// <summary>
    /// FAQ business logic implementation providing access to seeded culinary platform FAQs.
    /// </summary>
    public class FaqService : IFaqService
    {
        private readonly IUnitOfWork _uow;

        public FaqService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<ApiResponse<IEnumerable<FaqDto>>> GetAllAsync()
        {
            var faqs = await _uow.Repository<Faq>().QueryReadOnly()
                .OrderBy(f => f.DisplayOrder)
                .Select(f => new FaqDto
                {
                    FaqId = f.FaqId,
                    Question = f.Question,
                    Answer = f.Answer,
                    DisplayOrder = f.DisplayOrder
                })
                .ToListAsync();

            return ApiResponse<IEnumerable<FaqDto>>.Ok(faqs);
        }

        public async Task<ApiResponse<FaqDto>> GetByIdAsync(int id)
        {
            var faq = await _uow.Repository<Faq>().GetByIdAsync(id);
            if (faq == null)
            {
                return ApiResponse<FaqDto>.Fail("FAQ item not found.");
            }

            return ApiResponse<FaqDto>.Ok(new FaqDto
            {
                FaqId = faq.FaqId,
                Question = faq.Question,
                Answer = faq.Answer,
                DisplayOrder = faq.DisplayOrder
            });
        }
    }
}

