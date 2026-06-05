using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface ICustomServiceRequestService
    {
        Task<CustomServiceRequest> CreateAsync(string userId, CustomServiceRequest request);
        Task<IEnumerable<CustomServiceRequest>> GetByUserAsync(string userId);
        Task<CustomServiceRequest> GetByIdAsync(Guid id);
        
    }
}
