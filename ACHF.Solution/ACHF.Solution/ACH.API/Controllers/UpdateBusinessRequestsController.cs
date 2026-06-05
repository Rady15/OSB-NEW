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
    public class UpdateBusinessRequestsController : BaseApiController
    {
        private readonly IUpdateDataServiceRequest _service;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public UpdateBusinessRequestsController(
            IUpdateDataServiceRequest service,
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
        public async Task<ActionResult<UpdateBusinessRequestDto>> Create([FromForm] CreateUpdateBusinessRequestDto dto)
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
                        var fn = DocumentSettings.UploadFile(file, "UpdateBusiness");
                        fileUrl = $"/files/UpdateBusiness/{fn}";
                    }
                    uploadedPaths.Add(fileUrl);
                }
            }

            var request = _mapper.Map<UpdateDataServiceRequest>(dto);
            var createdRequest = await _service.CreateAsync(userId, request, uploadedPaths);

            var result = _mapper.Map<UpdateBusinessRequestDto>(createdRequest);
            result.FileUrls = createdRequest.Request.Files.Select(f => f.FileUrl).ToList();
            result.Status = createdRequest.Request.Status.ToString();
            result.RequestId = createdRequest.Request.Id;
            result.CreatedAt = createdRequest.Request.CreatedAt;

            await _notificationService.SendToAdminsAndStaffAsync(
                $"New UpdateBusiness request from user {userId}");

            return Ok(result);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<UpdateBusinessRequestDto>>> GetMyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);

            var result = requests.Select(r => new UpdateBusinessRequestDto
            {
                Id = r.Id,
                UpdateType = r.UpdateType,
                NewAddress = r.NewAddress,
                NewLegalRepName = r.NewLegalRepName,
                NewLegalRepIdNumber = r.NewLegalRepIdNumber,
                FileUrls = r.Request.Files.Select(f => f.FileUrl).ToList(),
                Status = r.Request.Status.ToString(),
                RequestId = r.Request.Id,
                CreatedAt = r.Request.CreatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UpdateBusinessRequestDto>> Get(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            var result = _mapper.Map<UpdateBusinessRequestDto>(request);
            result.FileUrls = request.Request.Files.Select(f => f.FileUrl).ToList();
            result.Status = request.Request.Status.ToString();
            result.RequestId = request.Request.Id;
            result.CreatedAt = request.Request.CreatedAt;

            return Ok(result);
        }
    }
}