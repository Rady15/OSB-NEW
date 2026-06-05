using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface ILaborOfficeServiceRequestService
    {
        Task<LaborOfficeServiceRequest> CreateAsync(string userId,
               LaborOfficeServiceRequest request,
               List<string> uploadedFilePaths);
        Task<IEnumerable<LaborOfficeServiceRequest>> GetByUserAsync(string userId);
        Task<LaborOfficeServiceRequest?> GetByIdAsync(Guid id);
    }
}
