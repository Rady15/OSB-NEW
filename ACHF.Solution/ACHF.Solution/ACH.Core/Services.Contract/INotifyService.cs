using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface INotifyService
    {
        Task SendPushNotificationAsync(string deviceToken, string title, string body, Dictionary<string, string>? data = null);

    }
}
