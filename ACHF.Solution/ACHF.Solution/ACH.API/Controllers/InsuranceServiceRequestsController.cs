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
 //   [ServiceFilter(typeof(ActiveUserFilter))]
    public class InsuranceServiceRequestsController : BaseApiController
    {
        private readonly IInsuranceServiceRequestService _service;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public InsuranceServiceRequestsController(
            IInsuranceServiceRequestService service,
            INotificationService notificationService,
            UserManager<AppUser> userManager)
        {
            _service = service;
            _notificationService = notificationService;
            _userManager = userManager;
        }

        [HttpPost("Create")]
        public async Task<ActionResult<InsuranceServiceRequestDto>> Create(
            [FromForm] CreateInsuranceServiceRequestDto dto)
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
                        var fn = DocumentSettings.UploadFile(file, "InsuranceService");
                        fileUrl = $"/files/InsuranceService/{fn}";
                    }
                    uploadedPaths.Add(fileUrl);
                }
            }

            var insuranceRequest = new InsuranceServiceRequest
            {
                ServiceType = Enum.Parse<InsuranceServiceType>(dto.ServiceType),
                EmployeeName = dto.EmployeeName,
                NationalId = dto.NationalId,
                BirthDate = dto.BirthDate,
                BasicSalary = dto.BasicSalary,
                EmploymentDate = dto.EmploymentDate
            };

            var createdRequest = await _service.CreateAsync(userId, insuranceRequest, uploadedPaths);

            var response = new InsuranceServiceRequestDto
            {
                Id = createdRequest.Id,
                ServiceType = createdRequest.ServiceType,
                EmployeeName = createdRequest.EmployeeName,
                NationalId = createdRequest.NationalId,
                BirthDate = createdRequest.BirthDate,
                BasicSalary = createdRequest.BasicSalary,
                EmploymentDate = createdRequest.EmploymentDate,
                FileUrls = createdRequest.Request.Files.Select(f => f.FileUrl).ToList(),
                Status = createdRequest.Request.Status.ToString(),
                CreatedAt = createdRequest.Request.CreatedAt,
                RequestId = createdRequest.Request.Id,
                UserId = createdRequest.Request.UserId,
                RequestType = createdRequest.Request.ServiceType.ToString()
            };

            await _notificationService.SendToAdminsAndStaffAsync(
                $"New InsuranceService request from user {userId}");

            return Ok(response);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<InsuranceServiceRequestDto>>> MyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);

            var result = requests.Select(r => new InsuranceServiceRequestDto
            {
                Id = r.Id,
                ServiceType = r.ServiceType,
                EmployeeName = r.EmployeeName,
                NationalId = r.NationalId,
                BirthDate = r.BirthDate,
                BasicSalary = r.BasicSalary,
                EmploymentDate = r.EmploymentDate,
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
        public async Task<ActionResult<InsuranceServiceRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            var response = new InsuranceServiceRequestDto
            {
                Id = request.Id,
                ServiceType = request.ServiceType,
                EmployeeName = request.EmployeeName,
                NationalId = request.NationalId,
                BirthDate = request.BirthDate,
                BasicSalary = request.BasicSalary,
                EmploymentDate = request.EmploymentDate,
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