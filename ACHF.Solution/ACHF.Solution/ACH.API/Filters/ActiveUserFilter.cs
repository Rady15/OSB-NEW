using ACH.Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace ACH.API.Filters
{
    public class ActiveUserFilter : IAsyncAuthorizationFilter
    {
        private readonly UserManager<AppUser> _userManager;

        public ActiveUserFilter(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var userPrincipal = context.HttpContext.User;

            if (userPrincipal == null || !userPrincipal.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var username = userPrincipal.FindFirstValue(System.Security.Claims.ClaimTypes.GivenName);

            if (string.IsNullOrEmpty(username))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var user = await _userManager.FindByIdAsync(username);

            if (user == null)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            if (!user.IsActive)
            {
                context.Result = new ObjectResult(new
                {
                    message = "Your account is suspended"
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }
        }
    }
}