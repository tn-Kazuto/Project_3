using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// FAQ controller providing access to the 7 mandatory frequently asked questions required by the SRS.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class FaqsController : ControllerBase
    {
        private readonly IFaqService _faqService;

        public FaqsController(IFaqService faqService)
        {
            _faqService = faqService;
        }

        /// <summary>
        /// Retrieves the list of 7 mandatory FAQs ordered by display sequence.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<FaqDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _faqService.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Retrieves a specific FAQ item by ID.
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ApiResponse<FaqDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _faqService.GetByIdAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
    }
}

