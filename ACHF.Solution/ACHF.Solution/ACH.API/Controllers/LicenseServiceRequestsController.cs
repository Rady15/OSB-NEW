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
    public class LicenseServiceRequestsController : BaseApiController
    {
        private readonly ILicenseServiceRequestService _service;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public LicenseServiceRequestsController(
            ILicenseServiceRequestService service,
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
        public async Task<ActionResult<LicenseServiceRequestDto>> Create([FromForm] CreateLicenseServiceRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);

            var uploadedPaths = new List<string>();
            if (dto.Documents != null && dto.Documents.Any())
            {
                foreach (var file in dto.Documents)
                {
                    string fileUrl;
                    if (user != null && !string.IsNullOrWhiteSpace(user.CompanyName))
                        fileUrl = DocumentSettings.UploadCompanyFile(file, user.CompanyName);
                    else
                    {
                        var fn = DocumentSettings.UploadFile(file, "LicenseService");
                        fileUrl = $"/files/LicenseService/{fn}";
                    }
                    uploadedPaths.Add(fileUrl);
                }
            }

            var licenseRequest = _mapper.Map<LicenseServiceRequest>(dto);
            var createdRequest = await _service.CreateAsync(userId, licenseRequest, uploadedPaths);

            var response = new LicenseServiceRequestDto
            {
                Id = createdRequest.Id,
                LicenseType = createdRequest.LicenseType.ToString(),
                FileUrls = createdRequest.Request.Files.Select(f => f.FileUrl).ToList(),
                UserId = userId,
                RequestId = createdRequest.Request.Id,
                CreatedAt = createdRequest.Request.CreatedAt,
                Status = createdRequest.Request.Status.ToString()
            };

            await _notificationService.SendToAdminsAndStaffAsync(
                $"New LicenseService request from user {userId}");

            return Ok(response);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<LicenseServiceRequestDto>>> GetMyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);

            var result = requests.Select(r =>
            {
                var dto = _mapper.Map<LicenseServiceRequestDto>(r);
                dto.FileUrls = r.Request.Files.Select(f => f.FileUrl).ToList();
                dto.UserId = userId;
                dto.ServiceType = r.Request.ServiceType.ToString();
                return dto;
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LicenseServiceRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            var dto = _mapper.Map<LicenseServiceRequestDto>(request);
            dto.FileUrls = request.Request.Files.Select(f => f.FileUrl).ToList();
            dto.UserId = userId;
            dto.ServiceType = request.Request.ServiceType.ToString();

            return Ok(dto);
        }
    }
}