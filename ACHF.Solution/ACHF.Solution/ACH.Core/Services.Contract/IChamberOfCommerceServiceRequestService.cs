using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IChamberOfCommerceServiceRequestService
    {
        Task<ChamberOfCommerceServiceRequest> CreateAsync(
             string userId,
             ChamberOfCommerceServiceRequest request,
             List<string> uploadedFilePaths);
        Task<IEnumerable<ChamberOfCommerceServiceRequest>> GetByUserAsync(string userId);
        Task<ChamberOfCommerceServiceRequest> GetByIdAsync(Guid id);
        }
}
