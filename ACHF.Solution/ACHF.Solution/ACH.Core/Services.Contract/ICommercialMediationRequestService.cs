using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface ICommercialMediationRequestService
    {
        Task<CommercialMediationRequest> CreateAsync(
                string userId,
                CommercialMediationRequest request,
                List<string> uploadedFilePaths);
        Task<IEnumerable<CommercialMediationRequest>> GetByUserAsync(string userId);
        Task<CommercialMediationRequest> GetByIdAsync(Guid id);
    }
}
