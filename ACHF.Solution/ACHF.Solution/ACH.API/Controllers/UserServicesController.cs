using ACH.API.DTOs;
using ACH.Core.Entities;
using ACH.Core.Entities.Identity;
using ACH.Core.Services.Contract;
using ACH.Service;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Stripe.Forwarding;
using System.Security.Claims;

namespace ACH.API.Controllers
{
    public class UserServicesController : BaseApiController
    {
        private readonly IRequestService _service;
        private readonly IMapper _mapper;
        private readonly INotifyService _notificationService;
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<UserServicesController> _logger;


        public UserServicesController(
            IRequestService service,
            IMapper mapper,
            INotifyService notificationService,
            UserManager<AppUser> userManager,
            ILogger<UserServicesController> logger)
        {
            _service = service;
            _mapper = mapper;
            _notificationService = notificationService;
            _userManager = userManager;
            _logger = logger;
        }
        [Authorize]

        [HttpGet("MyAllServices")]
        public async Task<IActionResult> MyAllServices()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var data = await _service.GetUserServicesAsync(userId);
            return Ok(data);
        }
        [Authorize(Roles = "Admin,Staff")]
        [HttpPost("add-description")]
        public async Task<IActionResult> AddDescription(AddDescriptionDto dto)
        {
            var request = await _service.AddRequestDescriptionAsync(dto.RequestId, dto.Description);

            if (request == null)
                return NotFound(new { message = "Request not found" });

            var user = await _userManager.FindByIdAsync(request.UserId);

            if (user != null && !string.IsNullOrEmpty(user.DeviceToken))
            {
                try
                {
                    await _notificationService.SendPushNotificationAsync(
                        user.DeviceToken,
                        "Documents Missing",
                        dto.Description,
                        new Dictionary<string, string>
                        {
                    { "screen", "requestDetails" },
                    { "RequestCode", request.RequestCode.ToString() },
                    { "type", "descriptionAdded" }
                        }
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send description notification");
                }
            }

            return Ok(new { message = "Description added and notification sent" });
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<ActionResult<List<UserFullServiceRequest>>> GetAllRequests()
        {
            var requests = await _service.GetAllRequestsWithDetailsAsync();

            return Ok(requests);
        }

        [HttpGet("AllZakat")]
        public async Task<IActionResult> GetAllZakat()
        {
            var data = await _service.GetAllZakatAsync();
            return Ok(data);
        }

        [HttpGet("Serivce-status-counts")]
        public async Task<ActionResult<Dictionary<string, int>>> GetStatusCounts()
        {
            var counts = await _service.GetAllStatusCountsAsync();
            return Ok(counts);
        }
        [HttpGet("GetAllRequest")]

        public async Task<ActionResult<List<RequestDto>>> GetAll()
        {
            var requests = await _service.GetAllRequestsAsync();
            var result = _mapper.Map<List<RequestDto>>(requests);
            return Ok(result);
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("set-price")]
        public async Task<IActionResult> SetRequestPrice(SetRequestPriceDto dto)
        {
            var request = await _service.GetRequestByIdAsync(dto.RequestId);
            if (request == null)
                return NotFound("Request not found");

            var result = await _service.SetRequestPriceAsync(dto.RequestId, dto.Price);
            if (!result)
                return BadRequest("Failed to set price");

            var user = await _userManager.FindByIdAsync(request.UserId);

            _logger.LogInformation("User found: {Found}, DeviceToken: {Token}",
                user != null, user?.DeviceToken);

            if (user != null && !string.IsNullOrEmpty(user.DeviceToken))
            {
                try
                {
                    await _notificationService.SendPushNotificationAsync(
                        user.DeviceToken,
                     "Your Request Is Ready",
$"The price for request #{request.RequestCode} is {dto.Price} SAR. Tap to view details.",
                        new Dictionary<string, string>
                        {
                    { "screen", "notification" },
                    { "requestId", request.Id.ToString() }
                        }
                    );
                    _logger.LogInformation("Notification sent successfully");
                }
                catch (Exception ex)

                {
                    _logger.LogError(ex, "Failed to send notification: {Message}", ex.Message);
                }
            }
            else
            {
                _logger.LogWarning("User is null OR DeviceToken is empty. UserId: {UserId}",
                    request.UserId);
            }

            return Ok(new { message = "Price sent to user successfully" });
        }


        [Authorize(Roles = "Admin")]
        [HttpPost("assign-request")]
        public async Task<IActionResult> AssignRequest(AssignRequestDto dto)
        {
            var result = await _service.AssignRequestToEmployee(dto.RequestId, dto.EmployeeUserId);

            if (!result)
                return NotFound("Request not found");

            return Ok("Request assigned successfully");
        }


        [Authorize(Roles = "Staff")]
        [HttpGet("my-requests")]
        public async Task<IActionResult> MyRequests()
        {
            var employeeId = User.FindFirst(ClaimTypes.GivenName)?.Value;

            var data = await _service.GetEmployeeRequests(employeeId);

            return Ok(data);
        }
        //[HttpPut("update-status")]
        //[Authorize(Roles = "Admin,Staff")]  
        //public async Task<IActionResult> UpdateStatus(UpdateRequestStatusDto model)
        //{
        //    var result = await _service.UpdateRequestStatusAsync(model.RequestId, model.Status);

        //    if (!result)
        //        return NotFound(new { message = "Request not found" });

        //    return Ok(new { message = "Status updated successfully" });
        //}
        [HttpPut("update-status")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateStatus(UpdateRequestStatusDto model)
        {
            var request = await _service.GetRequestByIdAsync(model.RequestId);
            if (request == null)
                return NotFound(new { message = "Request not found" });

            var result = await _service.UpdateRequestStatusAsync(model.RequestId, model.Status);
            if (!result)
                return BadRequest(new { message = "Failed to update status" });

            var user = await _userManager.FindByIdAsync(request.UserId);

            if (user != null && !string.IsNullOrEmpty(user.DeviceToken))
            {
                try
                {
                    await _notificationService.SendPushNotificationAsync(
                        user.DeviceToken,
                        "Request Status Updated",
                        GetStatusMessage(request.RequestCode, model.Status),
                        new Dictionary<string, string>
                        {
                    { "screen", "requestDetails" },
                    { "RequestCode", request.RequestCode },
                     { "status", model.Status.ToString() }
                        }
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send status update notification");
                }
            }

            return Ok(new { message = "Status updated successfully" });
        }
        private string GetStatusMessage(string RequestCode, RequestStatus status)
        {
            return status switch
            {
                RequestStatus.Pending =>
                    $"Your request #{RequestCode} is now pending.",

                RequestStatus.InProgress =>
                    $"Your request #{RequestCode} is being processed.",

                RequestStatus.Completed =>
                    $"Your request #{RequestCode} has been completed.",

                RequestStatus.Cancelled =>
                    $"Your request #{RequestCode} has been cancelled.",

                _ =>
                    $"The status of your request #{RequestCode} has been updated."
            };
        } 
        //[Authorize(Roles = "Admin")]
        //[HttpGet("employees")]
        //public async Task<IActionResult> GetAllEmployees()
        //{
        //    var employees = await _service.GetEmployeeRequests();
        //    return Ok(employees.Select(e => new
        //    {
        //        e.Id,
        //        e.UserName,
        //        e.Email
        //    }));
        //}


    }
}
