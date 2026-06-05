using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ACH.Core.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole == "Admin")
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admin");

            if (userRole == "Staff")
                await Groups.AddToGroupAsync(Context.ConnectionId, "Staff");

            await base.OnConnectedAsync();
        }
    }
}
