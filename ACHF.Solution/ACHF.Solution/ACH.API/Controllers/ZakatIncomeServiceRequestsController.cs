using ACH.API.DTOs;
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
    public class ZakatIncomeServiceRequestsController : BaseApiController
    {
        private readonly IZakatIncomeServiceRequestService _service;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public ZakatIncomeServiceRequestsController(
            IZakatIncomeServiceRequestService service,
            INotificationService notificationService,
            UserManager<AppUser> userManager)
        {
            _service = service;
            _notificationService = notificationService;
            _userManager = userManager;
        }

        [HttpPost("Create")]
        public async Task<ActionResult<ZakatIncomeServiceRequestDto>> Create([FromForm] CreateZakatIncomeServiceRequestDto dto)
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
                        var fn = DocumentSettings.UploadFile(file, "ZakatIncome");
                        fileUrl = $"/files/ZakatIncome/{fn}";
                    }
                    uploadedPaths.Add(fileUrl);
                }
            }

            var zakatRequest = new ZakatIncomeServiceRequest
            {
                AnnualRevenue = dto.AnnualRevenue,
                Expenses = dto.Expenses,
                Costs = dto.Costs,
                FixedAssets = dto.FixedAssets,
                FiscalYear = dto.FiscalYear
            };

            var createdRequest = await _service.CreateAsync(userId, zakatRequest, uploadedPaths);

            var response = new ZakatIncomeServiceRequestDto
            {
                Id = createdRequest.Id,
                AnnualRevenue = createdRequest.AnnualRevenue,
                Expenses = createdRequest.Expenses,
                Costs = createdRequest.Costs,
                FixedAssets = createdRequest.FixedAssets,
                FiscalYear = createdRequest.FiscalYear,
                FileUrls = createdRequest.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = createdRequest.Request.ServiceType.ToString(),
                CreatedAt = createdRequest.Request.CreatedAt,
                RequestId = createdRequest.Request.Id,
                Status = createdRequest.Request.Status.ToString()
            };

            await _notificationService.SendToAdminsAndStaffAsync(
                $"New ZakatIncomeService request from user {userId}");

            return Ok(response);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<ZakatIncomeServiceRequestDto>>> MyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);

            var response = requests.Select(r => new ZakatIncomeServiceRequestDto
            {
                Id = r.Id,
                AnnualRevenue = r.AnnualRevenue,
                Expenses = r.Expenses,
                Costs = r.Costs,
                FixedAssets = r.FixedAssets,
                FiscalYear = r.FiscalYear,
                FileUrls = r.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = r.Request.ServiceType.ToString(),
                CreatedAt = r.Request.CreatedAt,
                RequestId = r.Request.Id,
                Status = r.Request.Status.ToString()
            }).ToList();

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ZakatIncomeServiceRequestDto>> Get(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            var response = new ZakatIncomeServiceRequestDto
            {
                Id = request.Id,
                AnnualRevenue = request.AnnualRevenue,
                Expenses = request.Expenses,
                Costs = request.Costs,
                FixedAssets = request.FixedAssets,
                FiscalYear = request.FiscalYear,
                FileUrls = request.Request.Files.Select(f => f.FileUrl).ToList(),
                ServiceType = request.Request.ServiceType.ToString(),
                CreatedAt = request.Request.CreatedAt,
                Status = request.Request.Status.ToString(),
                RequestId = request.Request.Id
            };

            return Ok(response);
        }
    }
}