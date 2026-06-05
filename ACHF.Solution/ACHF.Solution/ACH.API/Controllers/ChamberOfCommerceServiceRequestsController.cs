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
    public class ChamberOfCommerceServiceRequestsController : BaseApiController
    {
        private readonly IChamberOfCommerceServiceRequestService _service;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public ChamberOfCommerceServiceRequestsController(
            IChamberOfCommerceServiceRequestService service,
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
        public async Task<ActionResult<ChamberOfCommerceServiceRequestDto>> Create(
            [FromForm] CreateChamberOfCommerceServiceRequestDto dto)
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
                        var fn = DocumentSettings.UploadFile(file, "ChamberOfCommerce");
                        fileUrl = $"/files/ChamberOfCommerce/{fn}";
                    }
                    uploadedPaths.Add(fileUrl);
                }
            }

            var chamberRequest = _mapper.Map<ChamberOfCommerceServiceRequest>(dto);
            var created = await _service.CreateAsync(userId, chamberRequest, uploadedPaths);
            var response = _mapper.Map<ChamberOfCommerceServiceRequestDto>(created);
            response.FileUrls = created.Request.Files.Select(f => f.FileUrl).ToList();

            await _notificationService.SendToAdminsAndStaffAsync(
                $"New ChamberOfCommerce request from user {userId}");

            return Ok(response);
        }

        [HttpGet("MyRequests")]
        public async Task<ActionResult<IEnumerable<ChamberOfCommerceServiceRequestDto>>> MyRequests()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var requests = await _service.GetByUserAsync(userId);
            var response = _mapper.Map<List<ChamberOfCommerceServiceRequestDto>>(requests);
            foreach (var item in response)
            {
                var req = requests.First(x => x.Id == item.Id);
                item.FileUrls = req.Request.Files.Select(f => f.FileUrl).ToList();
            }
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChamberOfCommerceServiceRequestDto>> GetById(Guid id)
        {
            var request = await _service.GetByIdAsync(id);
            if (request == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (request.Request.UserId != userId) return Forbid();

            var response = _mapper.Map<ChamberOfCommerceServiceRequestDto>(request);
            response.FileUrls = request.Request.Files.Select(f => f.FileUrl).ToList();

            return Ok(response);
        }
    }
}