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
  //  [ServiceFilter(typeof(ActiveUserFilter))]
    public class FeasibilityStudyRequestsController : BaseApiController
    {
        private readonly IFeasibilityStudyRequestService _service;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public FeasibilityStudyRequestsController(
            IFeasibilityStudyRequestService service,
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
        public async Task<ActionResult<FeasibilityStudyRequestDto>> Create(
            [FromForm] CreateFeasibilityStudyRequestDto dto)
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
                        var fn = DocumentSettings.UploadFile(file, "FeasibilityStudy");
                        fileUrl = $"/files/FeasibilityStudy/{fn}";
                    }
                    uploadedPaths.Add(fileUrl);
                }
            }

            var request = _mapper.Map<FeasibilityStudyRequest>(dto);
            var createdRequest = await _service.CreateAsync(userId, request, uploadedPaths);

            var response = new FeasibilityStudyRequestDto
            {
                Id = createdRequest.Id,
                StudyType = createdRequest.StudyType.ToString(),
                ProjectName = createdRequest.ProjectName,
                ActivityType = createdRequest.ActivityType,
                Location = createdRequest.Location,
                ProposedCapital = createdRequest.ProposedCapital,
                FileUrls = createdRequest.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = createdRequest.Request.ServiceType.ToString(),
                CreatedAt = createdRequest.Request.CreatedAt,
                RequestId = createdRequest.Request.Id,
                Status = createdRequest.Request.Status.ToString(),
                UserId = createdRequest.Request.UserId
            };

            await _notificationService.SendToAdminsAndStaffAsync(
                $"New FeasibilityStudy request from user {userId}");

            return Ok(response);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<FeasibilityStudyRequestDto>>> MyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);

            var response = requests.Select(r => new FeasibilityStudyRequestDto
            {
                Id = r.Id,
                StudyType = r.StudyType.ToString(),
                ProjectName = r.ProjectName,
                ActivityType = r.ActivityType,
                Location = r.Location,
                ProposedCapital = r.ProposedCapital,
                FileUrls = r.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = r.Request.ServiceType.ToString(),
                CreatedAt = r.Request.CreatedAt,
                RequestId = r.Request.Id,
                Status = r.Request.Status.ToString(),
                UserId = r.Request.UserId
            }).ToList();

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FeasibilityStudyRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            var response = new FeasibilityStudyRequestDto
            {
                Id = request.Id,
                StudyType = request.StudyType.ToString(),
                ProjectName = request.ProjectName,
                ActivityType = request.ActivityType,
                Location = request.Location,
                ProposedCapital = request.ProposedCapital,
                FileUrls = request.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = request.Request.ServiceType.ToString(),
                CreatedAt = request.Request.CreatedAt,
                RequestId = request.Request.Id,
                Status = request.Request.Status.ToString(),
                UserId = request.Request.UserId
            };

            return Ok(response);
        }
    }
}