using ACH.API.DTOs;
using ACH.API.Filters;
using ACH.API.Helpers;
using ACH.Core.Entities;
using ACH.Core.Entities.Identity;
using ACH.Core.Services.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ACH.API.Controllers
{
    [Authorize]
   // [ServiceFilter(typeof(ActiveUserFilter))]
    public class InternationalServiceRequestsController : BaseApiController
    {
        private readonly IInternationalServiceRequestService _service;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public InternationalServiceRequestsController(
            IInternationalServiceRequestService service,
            INotificationService notificationService,
            UserManager<AppUser> userManager)
        {
            _service = service;
            _notificationService = notificationService;
            _userManager = userManager;
        }

        [HttpPost("Create")]
        public async Task<ActionResult<InternationalServiceRequestDto>> Create(
            [FromForm] CreateInternationalServiceRequestDto dto)
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
                        var fn = DocumentSettings.UploadFile(file, "InternationalService");
                        fileUrl = $"/files/InternationalService/{fn}";
                    }
                    uploadedPaths.Add(fileUrl);
                }
            }

            var request = new InternationalServiceRequest
            {
                ServiceType = Enum.Parse<InternationalServiceType>(dto.ServiceType),
                Country = dto.Country,
                ProposedActivity = dto.ProposedActivity,
                Capital = dto.Capital
            };

            var createdRequest = await _service.CreateAsync(userId, request, uploadedPaths);

            var response = new InternationalServiceRequestDto
            {
                Id = createdRequest.Id,
                ServiceType = createdRequest.ServiceType,
                Country = createdRequest.Country,
                ProposedActivity = createdRequest.ProposedActivity,
                Capital = createdRequest.Capital,
                FileUrls = createdRequest.Request.Files.Select(f => f.FileUrl).ToList(),
                Status = createdRequest.Request.Status.ToString(),
                CreatedAt = createdRequest.Request.CreatedAt,
                RequestId = createdRequest.Request.Id,
                UserId = createdRequest.Request.UserId,
                RequestType = createdRequest.Request.ServiceType.ToString()
            };

            await _notificationService.SendToAdminsAndStaffAsync(
                $"New InternationalService request from user {userId}");

            return Ok(response);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<InternationalServiceRequestDto>>> MyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);

            var result = requests.Select(r => new InternationalServiceRequestDto
            {
                Id = r.Id,
                ServiceType = r.ServiceType,
                Country = r.Country,
                ProposedActivity = r.ProposedActivity,
                Capital = r.Capital,
                FileUrls = r.Request.Files.Select(f => f.FileUrl).ToList(),
                Status = r.Request.Status.ToString(),
                CreatedAt = r.Request.CreatedAt,
                RequestId = r.Request.Id,
                UserId = r.Request.UserId,
                RequestType = r.Request.ServiceType.ToString()
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InternationalServiceRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            var response = new InternationalServiceRequestDto
            {
                Id = request.Id,
                ServiceType = request.ServiceType,
                Country = request.Country,
                ProposedActivity = request.ProposedActivity,
                Capital = request.Capital,
                FileUrls = request.Request.Files.Select(f => f.FileUrl).ToList(),
                Status = request.Request.Status.ToString(),
                CreatedAt = request.Request.CreatedAt,
                RequestId = request.Request.Id,
                UserId = request.Request.UserId,
                RequestType = request.Request.ServiceType.ToString()
            };

            return Ok(response);
        }
    }
}