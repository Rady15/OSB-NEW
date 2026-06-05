using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IRenewingCommercialRegistrationService
    {
        Task<Request> CreateRenewalRequestAsync(string userId, List<string> files);
    }
}
