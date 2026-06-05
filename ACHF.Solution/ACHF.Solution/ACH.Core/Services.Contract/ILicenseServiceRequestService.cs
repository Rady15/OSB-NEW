using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface  ILicenseServiceRequestService
    {
        Task<LicenseServiceRequest?> GetByIdAsync(Guid id);
        Task<IEnumerable<LicenseServiceRequest>> GetByUserAsync(string userId);
        Task<LicenseServiceRequest> CreateAsync(string userId, LicenseServiceRequest licenseRequest, List<string> uploadedFilePaths);
    }

}
