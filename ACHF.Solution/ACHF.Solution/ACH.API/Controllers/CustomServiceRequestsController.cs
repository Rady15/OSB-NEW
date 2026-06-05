using ACH.API.DTOs;
using ACH.API.Filters;
using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ACH.API.Controllers
{
    [Authorize]
//    [ServiceFilter(typeof(ActiveUserFilter))]

    public class CustomServiceRequestsController : BaseApiController
    {
        private readonly ICustomServiceRequestService _service;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        public CustomServiceRequestsController(
            ICustomServiceRequestService service,
            IMapper mapper,
            INotificationService notificationService)
        {
            _service = service;
            _mapper = mapper;
            _notificationService = notificationService;
        }
        [HttpPost("Create")]
        public async Task<ActionResult<CustomServiceRequestDto>> Create(
                   [FromBody] CreateCustomServiceRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var request = _mapper.Map<CustomServiceRequest>(dto);

            var createdRequest = await _service.CreateAsync(userId, request);

            var result = _mapper.Map<CustomServiceRequestDto>(createdRequest);
            await _notificationService.SendToAdminsAndStaffAsync(
    $"New CustomService request from user {userId} "
);
            return Ok(result);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<CustomServiceRequestDto>>> GetMyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var requests = await _service.GetByUserAsync(userId);

            var result = _mapper.Map<IEnumerable<CustomServiceRequestDto>>(requests);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CustomServiceRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null)
                return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);

            if (request.Request.UserId != userId)
                return Forbid();

            var result = _mapper.Map<CustomServiceRequestDto>(request);
            return Ok(result);
        }

    }
}
