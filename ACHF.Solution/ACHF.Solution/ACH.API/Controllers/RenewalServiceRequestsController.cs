using ACH.API.DTOs;
using ACH.API.Filters;
using ACH.API.Helpers;
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
  //  [ServiceFilter(typeof(ActiveUserFilter))]
    public class RenewalServiceRequestsController : BaseApiController
    {
        private readonly IRenewalServiceRequestService _service;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public RenewalServiceRequestsController(
            IRenewalServiceRequestService service,
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
        public async Task<ActionResult<RenewalServiceRequestDto>> Create([FromForm] CreateRenewalServiceRequestDto dto)
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
                        var fn = DocumentSettings.UploadFile(file, "Renewal");
                        fileUrl = $"/files/Renewal/{fn}";
                    }
                    uploadedPaths.Add(fileUrl);
                }
            }

            var createdRequest = await _service.CreateAsync(userId, uploadedPaths);

            var result = new RenewalServiceRequestDto
            {
                RequestId = createdRequest.Request.Id,
                Status = createdRequest.Request.Status.ToString(),
                CreatedAt = createdRequest.Request.CreatedAt,
                FileUrls = createdRequest.Request.Files.Select(f => f.FileUrl).ToList()
            };

            await _notificationService.SendToAdminsAndStaffAsync(
                $"New RenewalService request from user {userId}");

            return Ok(result);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<RenewalServiceRequestDto>>> GetMyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);

            var result = requests.Select(r => new RenewalServiceRequestDto
            {
                RequestId = r.Request.Id,
                Status = r.Request.Status.ToString(),
                CreatedAt = r.Request.CreatedAt,
                FileUrls = r.Request.Files.Select(f => f.FileUrl).ToList()
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RenewalServiceRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            var dto = new RenewalServiceRequestDto
            {
                RequestId = request.Request.Id,
                Status = request.Request.Status.ToString(),
                CreatedAt = request.Request.CreatedAt,
                FileUrls = request.Request.Files.Select(f => f.FileUrl).ToList()
            };

            return Ok(dto);
        }
    }
}