using ACH.Core.Entities;
using ACH.Core.Entities.Identity;
using ACH.Core.Services.Contract;
using ACH.Repository.Data;
using ACH.Repository.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ACH.Service
{
    public class AuthService : IAuthService

    {


        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly ACHContext _achContext;

        public AuthService(IConfiguration configuration, ApplicationDbContext _context, UserManager<AppUser> userManager, ACHContext achContext)
        {
            _configuration = configuration;
            this._context = _context;
            _userManager = userManager;
            _achContext = achContext;
        }
        public async Task<string> CreateTokenAsync(AppUser user, UserManager<AppUser> _userManager)
        {
            var auth = new List<Claim>()
            {new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.GivenName, user.Id),
                new Claim(ClaimTypes.Email , user.Email),
                 new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var userRoles = await _userManager.GetRolesAsync(user);
            foreach (var role in userRoles)
            {
                auth.Add(new Claim(ClaimTypes.Role, role));
            }

            var authkey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:secretkey"]));
            var token = new JwtSecurityToken(

                audience: _configuration["JWT:valiedaudiance"],
                issuer: _configuration["JWT:valiedIssuer"],
               expires: DateTime.UtcNow.AddMinutes(
    double.Parse(
        _configuration["JWT:DurationInMinutes"])),
                claims: auth,
                signingCredentials: new SigningCredentials(authkey, SecurityAlgorithms.HmacSha256Signature)
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> SuspendUserAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return false;

            user.IsActive = false;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        //public async Task<bool> DeleteUserAsync(string userId)
        //{
        //    var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userId);
        //    if (user == null)
        //        return false;

        //    _context.Users.Remove(user);
        //    await _context.SaveChangesAsync();
        //    return true;
        //}
        public async Task<bool> DeleteUserAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return false;

            var userRequests = await _achContext.Requests
                .Where(r => r.UserId == userId)
                .ToListAsync();

            _achContext.Requests.RemoveRange(userRequests);
            await _achContext.SaveChangesAsync();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<UserInfo>> GetAllUsersAsync()
        {
            var users = await _userManager.GetUsersInRoleAsync("User");

            return users.Select(u => new UserInfo
            {
                Id = u.Id,
                Email = u.Email,
                UserName = u.UserName,
                PhoneNumber = u.PhoneNumber,
                IsActive = u.IsActive
            }).ToList();
        }
        public async Task<IEnumerable<UserInfo>> GetAllEmployeesAsync()
        {
            var employees = await _userManager.GetUsersInRoleAsync("Staff");

            return employees.Select(u => new UserInfo
            {
                Id = u.Id,
                Email = u.Email,
                UserName = u.UserName,
                PhoneNumber = u.PhoneNumber,
                IsActive = u.IsActive
            }).ToList();
        }

        public async Task<bool> UnsuspendUserAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return false;

            user.IsActive = true;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }
        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];

            using var rng = RandomNumberGenerator.Create();

            rng.GetBytes(randomNumber);

            return Convert.ToBase64String(randomNumber);
        }
        public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters =
                new TokenValidationParameters
                {
                    ValidateAudience = true,
                    ValidateIssuer = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = false,

                    ValidIssuer = _configuration["JWT:valiedIssuer"],

                    ValidAudience = _configuration["JWT:valiedaudiance"],

                    IssuerSigningKey =
                        new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(
                                _configuration["JWT:secretkey"]))
                };

            var tokenHandler = new JwtSecurityTokenHandler();

            var principal = tokenHandler.ValidateToken(
                token,
                tokenValidationParameters,
                out SecurityToken securityToken);

            return principal;
        }
        public async Task<UserStats> GetUserStatisticsAsync()
        {
            var allUsers = await _userManager.Users.ToListAsync();

            var totalUsers = allUsers.Count;

            var currentMonthUsers = allUsers
                .Count(u => u.CreatedAt.Month == DateTime.UtcNow.Month && u.CreatedAt.Year == DateTime.UtcNow.Year);

            var activeUsers = allUsers.Count(u => u.IsActive);

            return new UserStats
            {
                TotalUsers = totalUsers,
                NewUsersThisMonth = currentMonthUsers,
                ActiveUsers = activeUsers
            };
        }
        public async Task<AppUser> GetUserProfileAsync(string userId)
        {
            return await _userManager.FindByIdAsync(userId);
        }
    }
}
