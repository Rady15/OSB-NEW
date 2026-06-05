using ACH.Core.Entities;
using ACH.Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IAuthService
    {
        Task<string> CreateTokenAsync(
            AppUser user,
            UserManager<AppUser> userManager);

        string GenerateRefreshToken();

        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);

        Task<bool> SuspendUserAsync(string userId);

        Task<bool> UnsuspendUserAsync(string userId);

        Task<bool> DeleteUserAsync(string userId);

        Task<IEnumerable<UserInfo>> GetAllUsersAsync();

        Task<IEnumerable<UserInfo>> GetAllEmployeesAsync();

        Task<UserStats> GetUserStatisticsAsync();

        Task<AppUser> GetUserProfileAsync(string userId);
    }
}
