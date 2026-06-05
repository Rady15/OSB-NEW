using ACH.Core.Hubs;
using ACH.Core.Services.Contract;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class SignalRNotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public SignalRNotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToUserAsync(string userId, string message)
        {
            await _hubContext.Clients.Group(userId)
                .SendAsync("ReceiveNotification", message);
        }

        public async Task SendToAllAsync(string message)
        {
            await _hubContext.Clients.All
                .SendAsync("ReceiveNotification", message);
        }

        public async Task SendToAdminsAndStaffAsync(string message)
        {
            await _hubContext.Clients.Groups("Admins", "Staff")
                .SendAsync("ReceiveNotification", message);
        }
    }
}
