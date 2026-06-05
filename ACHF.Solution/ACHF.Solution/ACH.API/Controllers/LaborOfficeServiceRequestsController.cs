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
    public class LaborOfficeServiceRequestsController : BaseApiController
    {
        private readonly ILaborOfficeServiceRequestService _service;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public LaborOfficeServiceRequestsController(
            ILaborOfficeServiceRequestService service,
            INotificationService notificationService,
            UserManager<AppUser> userManager)
        {
            _service = service;
            _notificationService = notificationService;
            _userManager = userManager;
        }

        [HttpPost("Create")]
        public async Task<ActionResult<LaborOfficeServiceRequestDto>> Create([FromForm] CreateLaborOfficeServiceRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

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
                        var fn = DocumentSettings.UploadFile(file, "LaborOffice");
                        fileUrl = $"/files/LaborOffice/{fn}";
                    }
                    uploadedPaths.Add(fileUrl);
                }
            }

            var laborRequest = new LaborOfficeServiceRequest
            {
                ServiceType = Enum.Parse<LaborOfficeServiceType>(dto.ServiceType),
                WorkerName = dto.WorkerName,
                IqamaNumber = dto.IqamaNumber,
                Nationality = dto.Nationality,
                Profession = dto.Profession,
                IqamaExpiryDate = dto.IqamaExpiryDate
            };

            var createdRequest = await _service.CreateAsync(userId, laborRequest, uploadedPaths);

            var response = new LaborOfficeServiceRequestDto
            {
                Id = createdRequest.Id,
                WorkerName = createdRequest.WorkerName,
                IqamaNumber = createdRequest.IqamaNumber,
                Nationality = createdRequest.Nationality,
                Profession = createdRequest.Profession,
                IqamaExpiryDate = createdRequest.IqamaExpiryDate,
                FileUrls = createdRequest.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = createdRequest.Request.ServiceType.ToString(),
                CreatedAt = createdRequest.Request.CreatedAt,
                RequestId = createdRequest.Request.Id,
                Status = createdRequest.Request.Status.ToString(),
                UserId = createdRequest.Request.UserId,
                LaborType = createdRequest.ServiceType.ToString()
            };

            await _notificationService.SendToAdminsAndStaffAsync(
                $"New LaborOfficeService request from user {userId}");

            return Ok(response);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<LaborOfficeServiceRequestDto>>> MyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);

            var response = requests.Select(r => new LaborOfficeServiceRequestDto
            {
                Id = r.Id,
                WorkerName = r.WorkerName,
                IqamaNumber = r.IqamaNumber,
                Nationality = r.Nationality,
                Profession = r.Profession,
                IqamaExpiryDate = r.IqamaExpiryDate,
                FileUrls = r.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = r.Request.ServiceType.ToString(),
                CreatedAt = r.Request.CreatedAt,
                RequestId = r.Request.Id,
                Status = r.Request.Status.ToString(),
                UserId = r.Request.UserId,
                LaborType = r.ServiceType.ToString()
            }).ToList();

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LaborOfficeServiceRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            var response = new LaborOfficeServiceRequestDto
            {
                Id = request.Id,
                WorkerName = request.WorkerName,
                IqamaNumber = request.IqamaNumber,
                Nationality = request.Nationality,
                Profession = request.Profession,
                IqamaExpiryDate = request.IqamaExpiryDate,
                FileUrls = request.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = request.Request.ServiceType.ToString(),
                CreatedAt = request.Request.CreatedAt,
                RequestId = request.Request.Id,
                Status = request.Request.Status.ToString(),
                UserId = request.Request.UserId,
                LaborType = request.ServiceType.ToString()
            };

            return Ok(response);
        }
    }
}