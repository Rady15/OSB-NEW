using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IRenewalServiceRequestService
    {
        Task<RenewalServiceRequest> CreateAsync(string userId, List<string> uploadedFilePaths);
        Task<IEnumerable<RenewalServiceRequest>> GetByUserAsync(string userId);
        Task<RenewalServiceRequest?> GetByIdAsync(Guid id);
    }
}
