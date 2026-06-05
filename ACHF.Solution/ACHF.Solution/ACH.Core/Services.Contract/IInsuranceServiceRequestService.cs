using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IInsuranceServiceRequestService
    {
        Task<InsuranceServiceRequest> CreateAsync(string userId,
            InsuranceServiceRequest request,
            List<string> uploadedFilePaths);
        Task<IEnumerable<InsuranceServiceRequest>> GetByUserAsync(string userId);
        Task<InsuranceServiceRequest> GetByIdAsync(Guid id);
    }
}
