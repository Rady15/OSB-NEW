using ACH.API.DTOs;
using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using ACH.API.Filters;

namespace ACH.API.Controllers
{
    [Authorize]
 //   [ServiceFilter(typeof(ActiveUserFilter))]

    public class MarketResearchRequestsController : BaseApiController
    {
        private readonly IMarketResearchRequestService _service;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public MarketResearchRequestsController(IMarketResearchRequestService service, IMapper mapper, INotificationService notificationService)
        {
            _service = service;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        [HttpPost("Create")]
        public async Task<ActionResult<MarketResearchRequestDto>> Create([FromForm]CreateMarketResearchRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var request = _mapper.Map<MarketResearchRequest>(dto);
            var created = await _service.CreateAsync(userId, request);
            await _notificationService.SendToAdminsAndStaffAsync(
    $"New MarketResearch request from user {userId} "
);
            return Ok(_mapper.Map<MarketResearchRequestDto>(created));
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<MarketResearchRequestDto>>> GetMyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);
            return Ok(_mapper.Map<IEnumerable<MarketResearchRequestDto>>(requests));
        }

        [HttpGet("AllRequests")]
        public async Task<ActionResult<IEnumerable<MarketResearchRequestDto>>> GetAll()
        {
            var requests = await _service.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<MarketResearchRequestDto>>(requests));
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<MarketResearchRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            return Ok(_mapper.Map<MarketResearchRequestDto>(request));
        }
    }
}
