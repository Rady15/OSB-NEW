using ACH.API.DTOs;
using ACH.API.Filters;
using ACH.API.Helpers;
using ACH.Core.Entities;
using ACH.Core.Entities.Identity;
using ACH.Core.Services.Contract;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ACH.API.Controllers
{
    [Authorize]
   // [ServiceFilter(typeof(ActiveUserFilter))]
    public class LegalServiceRequestsController : BaseApiController
    {
        private readonly ILegalServiceRequestService _service;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public LegalServiceRequestsController(
            ILegalServiceRequestService service,
            IMapper mapper,
            INotificationService notificationService,
            UserManager<AppUser> userManager)
        {
            _service = service;
            _mapper = mapper;
            _notificationService = notificationService;
            _userManager = userManager;
        }

        [HttpPost("Create")]
        public async Task<ActionResult<LegalServiceRequestDto>> Create(
            [FromForm] CreateLegalServiceRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);

            var uploadedPaths = new List<string>();
            if (dto.Files != null && dto.Files.Any())
            {
                foreach (var file in dto.Files)
                {
                    string fileUrl;
                    if (user != null && !string.IsNullOrWhiteSpace(user.CompanyName))
                        fileUrl = DocumentSettings.UploadCompanyFile(file, user.CompanyName);
                    else
                    {
                        var fn = DocumentSettings.UploadFile(file, "LegalService");
                        fileUrl = $"/files/LegalService/{fn}";
                    }
                    uploadedPaths.Add(fileUrl);
                }
            }

            var legalRequest = _mapper.Map<LegalServiceRequest>(dto);
            var created = await _service.CreateAsync(userId, legalRequest, uploadedPaths);

            var response = new LegalServiceRequestDto
            {
                Id = created.Id,
                RequestDetails = created.RequestDetails,
                LegalField = created.LegalField,
                FileUrls = created.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = created.Request.ServiceType.ToString(),
                CreatedAt = created.Request.CreatedAt,
                RequestId = created.Request.Id,
                Status = created.Request.Status.ToString(),
                UserId = created.Request.UserId,
                LegalType = created.ServiceType.ToString()
            };

            await _notificationService.SendToAdminsAndStaffAsync(
                $"New LegalService request from user {userId}");

            return Ok(response);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<LegalServiceRequestDto>>> GetMyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);

            var response = requests.Select(r => new LegalServiceRequestDto
            {
                Id = r.Id,
                RequestDetails = r.RequestDetails,
                LegalField = r.LegalField,
                FileUrls = r.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = r.Request.ServiceType.ToString(),
                CreatedAt = r.Request.CreatedAt,
                RequestId = r.Request.Id,
                Status = r.Request.Status.ToString(),
                UserId = r.Request.UserId,
                LegalType = r.ServiceType.ToString()
            }).ToList();

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LegalServiceRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            var response = new LegalServiceRequestDto
            {
                Id = request.Id,
                RequestDetails = request.RequestDetails,
                LegalField = request.LegalField,
                FileUrls = request.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = request.Request.ServiceType.ToString(),
                CreatedAt = request.Request.CreatedAt,
                RequestId = request.Request.Id,
                Status = request.Request.Status.ToString(),
                UserId = request.Request.UserId,
                LegalType = request.ServiceType.ToString()
            };

            return Ok(response);
        }
    }
}