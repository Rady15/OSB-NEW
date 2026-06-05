using ACH.API.DTOs;
using ACH.API.Error;
using ACH.API.Helpers;
using ACH.Core.Entities;
using ACH.Core.Entities.Identity;
using ACH.Core.Services.Contract;
using ACH.Repository.Identity;
using FirebaseAdmin.Auth;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ACH.API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ApplicationDbContext _applicationDb;
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;
        public readonly ILogger<AccountController> _logger;

        public AccountController(
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            ILogger<AccountController> logger,
            ApplicationDbContext applicationDb,
            IAuthService authService,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _applicationDb = applicationDb;
            _authService = authService;
            _logger = logger;
            _configuration = configuration;
        }

        [Authorize]
        [HttpPost("update-device-token")]
        public async Task<IActionResult> UpdateDeviceToken([FromBody] UpdateDeviceTokenDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.GivenName)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId); 
            if (user == null)
                return NotFound("User not found.");

            user.DeviceToken = dto.DeviceToken;
            await _userManager.UpdateAsync(user);

            return Ok(new { message = "Device token updated successfully." });
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return Unauthorized(new ApiResponse(401, "Invalid email or password"));
            if (!user.IsActive)
                return Unauthorized(new ApiResponse(401, "User is not active"));

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (result.Succeeded is false)
                return Unauthorized(new ApiResponse(401));

            var roles = await _userManager.GetRolesAsync(user);
            var accessToken = await _authService.CreateTokenAsync(user, _userManager);
            var refreshToken = _authService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(30);
            await _userManager.UpdateAsync(user);

            return Ok(new
            {
                Email = user.Email,
                UserName = user.UserName,
                Roles = roles.ToList(),
                CompanyName = user.CompanyName,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register([FromForm] RegisterDto model)
        {
            if (CheckEmailExist(model.Email).Result.Value)
                return BadRequest(new ApiValidationErrorResponse()
                {
                    Errors = new string[] { "Email is in use" }
                });

            if (await _userManager.Users.AnyAsync(u => u.UserName == model.UserName))
                return BadRequest(new ApiValidationErrorResponse()
                {
                    Errors = new string[] { "Username is already taken" }
                });

            var user = new AppUser()
            {
                Email = model.Email,
                UserName = model.UserName,
                PhoneNumber = model.PhoneNumber,
                CompanyName = model.CompanyName,
            };

            if (model.ProfileImage != null)
            {
                string fileName = DocumentSettings.UploadFile(model.ProfileImage, "ProfileImages");
                user.ProfileImageUrl = "/files/ProfileImages/" + fileName;
            }

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return BadRequest(new ApiResponse(401));

            await _userManager.AddToRoleAsync(user, "User");
            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new UserDto()
            {
                Email = user.Email,
                Token = await _authService.CreateTokenAsync(user, _userManager),
                UserName = user.UserName,
                Roles = roles.ToList(),
                ProfileImageUrl = user.ProfileImageUrl,
                CompanyName = user.CompanyName,
            });
        }

        [HttpPost("google-login")]
        public async Task<ActionResult<UserDto>> GoogleLogin(GoogleLoginDto model)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string> { _configuration["Authentication:Google:ClientId"] }
                };

                var payload = await Google.Apis.Auth.GoogleJsonWebSignature
                    .ValidateAsync(model.IdToken, settings);

                if (payload == null)
                    return Unauthorized("Invalid Google Token");

                var user = await _userManager.FindByEmailAsync(payload.Email);

                if (user == null)
                {
                    user = new AppUser
                    {
                        Email = payload.Email,
                        UserName = payload.Name,
                        IsActive = true,
                        EmailConfirmed = true,
                        ProfileImageUrl = payload.Picture
                    };

                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded)
                        return BadRequest(result.Errors);

                    await _userManager.AddToRoleAsync(user, "User");
                }

                if (!user.IsActive)
                    return Unauthorized("User is suspended");

                var roles = await _userManager.GetRolesAsync(user);

                return Ok(new UserDto
                {
                    Email = user.Email,
                    UserName = user.UserName,
                    Roles = roles.ToList(),
                    CompanyName = user.CompanyName,
                    Token = await _authService.CreateTokenAsync(user, _userManager)
                });
            }
            catch (InvalidJwtException)
            {
                return Unauthorized("Invalid Google Token");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("firebase-login")]
        public async Task<IActionResult> FirebaseLogin([FromBody] FirebaseLoginRequest request)
        {
            try
            {
                var decodedToken = await FirebaseAuth.DefaultInstance
                    .VerifyIdTokenAsync(request.FirebaseToken);

                var uid = decodedToken.Uid;
                var email = decodedToken.Claims.GetValueOrDefault("email")?.ToString();
                var name = decodedToken.Claims.GetValueOrDefault("name")?.ToString() ?? "User";
                var picture = decodedToken.Claims.GetValueOrDefault("picture")?.ToString();

                if (string.IsNullOrEmpty(email))
                    return BadRequest("Email not found in token");

                var user = await _userManager.Users
                    .FirstOrDefaultAsync(u => u.FirebaseUid == uid);

                if (user == null)
                {
                    var existingUser = await _userManager.FindByEmailAsync(email);
                    if (existingUser != null)
                        return Conflict("Email already registered with another account.");

                    user = new AppUser
                    {
                        FirebaseUid = uid,
                        Email = email,
                        UserName = Guid.NewGuid().ToString(), 
                        ProfileImageUrl = picture,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    var createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                        return BadRequest(createResult.Errors);

                    var roleResult = await _userManager.AddToRoleAsync(user, "User");
                    if (!roleResult.Succeeded)
                        return BadRequest(roleResult.Errors);
                }
                else
                {
                    bool updated = false;
                    if (user.Email != email) { user.Email = email; updated = true; }
                    if (user.ProfileImageUrl != picture) { user.ProfileImageUrl = picture; updated = true; }

                    if (updated)
                    {
                        var updateResult = await _userManager.UpdateAsync(user);
                        if (!updateResult.Succeeded)
                            return BadRequest(updateResult.Errors);
                    }
                }

                var token = await _authService.CreateTokenAsync(user, _userManager);

                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.Id,
                        email,
                        name,
                        picture,
                        userName = user.UserName
                    }
                });
            }
            catch (FirebaseAuthException)
            {
                _logger.LogWarning("Firebase login failed: Invalid token");
                return Unauthorized("Invalid Firebase Token");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FirebaseLogin unexpected error");
                return StatusCode(500, "Something went wrong");
            }
        }

        [HttpPost("contact")]
        public IActionResult SendContact([FromBody] ContactDto contact)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var email = new Email
                {
                    Recipients = _configuration["ContactSettings:ReceiverEmail"],
                    Subject = contact.Subject,
                    Body = $"""
                        Name: {contact.Name}
                        Email: {contact.Email}
                        Phone: {contact.phoneNumber}

                        Message:
                        {contact.Message}
                        """,
                    IsHtml = false
                };

                EmailSettinges.SendEmail(email);
                return Ok(new { message = "Your message has been sent successfully." });
            }
            catch
            {
                return StatusCode(500, new { message = "Something went wrong while sending your message." });
            }
        }

        [Authorize]
        [HttpPost("complaints")]
        public IActionResult SendComplaint([FromForm] ComplaintDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string? uploadedFileName = null;

            try
            {
                var userName = User.FindFirstValue(ClaimTypes.GivenName);
                var userEmail = User.FindFirstValue(ClaimTypes.Email);

                if (model.Attachment != null)
                    uploadedFileName = DocumentSettings.UploadFile(model.Attachment, "Complaints");

                var email = new Email
                {
                    Recipients = "support@ach.com",
                    Subject = $"New Complaint - {model.Priority}",
                    Body = $"""
                        User ID: {userName}
                        User Email: {userEmail}

                        Category: {model.Category}
                        Priority: {model.Priority}

                        Description:
                        {model.Description}
                        """,
                    IsHtml = false,
                    AttachmentPath = uploadedFileName != null
                        ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "files", "Complaints", uploadedFileName)
                        : null
                };

                EmailSettinges.SendEmail(email);
                return Ok(new { message = "Complaint sent successfully" });
            }
            catch
            {
                if (uploadedFileName != null)
                    DocumentSettings.DeleteFile(uploadedFileName, "Complaints");

                return StatusCode(500, new { message = "Failed to send complaint." });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var principal = _authService.GetPrincipalFromExpiredToken(request.AccessToken);
            var userId = principal.FindFirstValue(ClaimTypes.GivenName);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId); 
            if (user == null)
                return Unauthorized();

            if (user.RefreshToken != request.RefreshToken)
                return Unauthorized();

            if (user.RefreshTokenExpiryTime < DateTime.UtcNow)
                return Unauthorized();

            var newAccessToken = await _authService.CreateTokenAsync(user, _userManager);
            var newRefreshToken = _authService.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(30);
            await _userManager.UpdateAsync(user);

            return Ok(new
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.GivenName)?.Value;
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Password changed successfully" });
        }

        [Authorize]
        [HttpPost("SignOut")]
        public async Task<ActionResult> SignOut()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var user = await _userManager.FindByIdAsync(userId); 

            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
            }

            await HttpContext.SignOutAsync();
            return Ok("Signed out successfully.");
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            var user = await _userManager.FindByEmailAsync(email);
            return Ok(new UserDto()
            {
                UserName = user.UserName,
                Email = user.Email,
                Token = await _authService.CreateTokenAsync(user, _userManager)
            });
        }

        [HttpGet("Emailexists")]
        public async Task<ActionResult<bool>> CheckEmailExist(string email)
        {
            return await _userManager.FindByEmailAsync(email) is not null;
        }

        [HttpPost("ForgetPassword")]
        public async Task<IActionResult> SendResetPasswordURL([FromBody] ForgetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetUrl = $"{Request.Scheme}://{Request.Host}/reset-password.html?email={user.Email}&token={Uri.EscapeDataString(token)}";

            var email = new Email
            {
                Subject = "Reset Your Password",
                Recipients = user.Email,
                Body = $"Click the link to reset your password: {resetUrl}"
            };

            EmailSettinges.SendEmail(email);
            return Ok(new { message = "Password reset link has been sent to your email" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(
            [FromQuery] string email,
            [FromQuery] string token,
            [FromBody] ResetPasswordDto model)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
                return BadRequest(new { message = "Invalid email or token." });

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);
            if (result.Succeeded)
                return Ok(new { message = "Password reset successful" });

            return BadRequest(result.Errors);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("suspend/{userId}")]
        public async Task<IActionResult> SuspendUser(string userId)
        {
            var result = await _authService.SuspendUserAsync(userId);
            if (!result)
                return NotFound(new ApiResponse(404, "User not found"));

            return Ok(new ApiResponse(200, $"User {userId} has been suspended successfully."));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("unsuspend/{userId}")]
        public async Task<IActionResult> UnsuspendUser(string userId)
        {
            var result = await _authService.UnsuspendUserAsync(userId);
            if (!result)
                return NotFound(new ApiResponse(404, "User not found"));

            return Ok(new ApiResponse(200, $"User {userId} has been reactivated successfully."));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            var result = await _authService.DeleteUserAsync(userId);
            if (!result)
                return NotFound(new ApiResponse(404, "User not found"));

            return Ok(new ApiResponse(200, $"User {userId} and all their service requests have been deleted successfully."));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _authService.GetAllUsersAsync();
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("AllStaff")]
        public async Task<IActionResult> GetAllStaff()
        {
            var users = await _authService.GetAllEmployeesAsync();
            return Ok(users);
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            var user = await _authService.GetUserProfileAsync(userId);

            if (user == null)
                return NotFound();

            var profile = new UserProfileDto
            {
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                ProfileImageUrl = user.ProfileImageUrl
            };

            return Ok(profile);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("status")]
        public async Task<ActionResult<UserStats>> GetUserstatus()
        {
            var stats = await _authService.GetUserStatisticsAsync();
            return Ok(stats);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("change-password-Admin")]
        public async Task<IActionResult> ChangePasswordAdmin(ChangePasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.GivenName)?.Value;
            var user = await _userManager.FindByIdAsync(userId); 

            if (user == null)
                return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Password changed successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("create-employee")]
        public async Task<ActionResult> CreateEmployee(CreateEmployeeDto model)
        {
            if (await _userManager.FindByEmailAsync(model.Email) != null)
                return BadRequest("Email already exists");

            if (await _userManager.FindByNameAsync(model.UserName) != null)
                return BadRequest("Username already exists");

            var user = new AppUser
            {
                Email = model.Email,
                UserName = model.UserName,
                IsActive = true,
                PhoneNumber = model.phoneNumber
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            var role = model.Role == "Admin" ? "Admin" : "Staff";
            await _userManager.AddToRoleAsync(user, role);

            return Ok(new
            {
                message = "Employee created successfully",
                user.Email,
                user.UserName,
                Role = role,
                user.PhoneNumber
            });
        }
    }
}