using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IInternationalServiceRequestService
    {
        Task<InternationalServiceRequest> CreateAsync(
              string userId,
              InternationalServiceRequest request,
              List<string> uploadedFilePaths);
        Task<IEnumerable<InternationalServiceRequest>> GetByUserAsync(string userId);
        Task<InternationalServiceRequest?> GetByIdAsync(Guid id);
    }
}
