using ACH.API.DTOs;
using ACH.API.Filters;
using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ACH.API.Controllers
{
    [Authorize]
  //  [ServiceFilter(typeof(ActiveUserFilter))]

    public class TechnicalServiceRequestsController : BaseApiController
    {
        private readonly ITechnicalServiceRequestService _service;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public TechnicalServiceRequestsController(ITechnicalServiceRequestService service, IMapper mapper, INotificationService notificationService)
        {
            _service = service;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        [HttpPost("Create")]
        public async Task<ActionResult<TechnicalServiceRequestDto>> Create(CreateTechnicalServiceRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var request = _mapper.Map<TechnicalServiceRequest>(dto);
            var created = await _service.CreateAsync(userId, request);
            await _notificationService.SendToAdminsAndStaffAsync(
    $"New TechnicalService request from user {userId}"
);
            return Ok(_mapper.Map<TechnicalServiceRequestDto>(created));
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<TechnicalServiceRequestDto>>> GetMyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);
            return Ok(_mapper.Map<IEnumerable<TechnicalServiceRequestDto>>(requests));
        }

      
        [HttpGet("{id}")]
        public async Task<ActionResult<TechnicalServiceRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            return Ok(_mapper.Map<TechnicalServiceRequestDto>(request));
        }
    }
}
