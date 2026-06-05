using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface INotificationService
    {
        Task SendToUserAsync(string userId, string message);
        Task SendToAllAsync(string message);
        Task SendToAdminsAndStaffAsync(string message);
    }
}
