using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IAccountingServiceRequestService
    {
        Task<AccountingServiceRequest> CreateAsync(
                 string userId,
                 AccountingServiceRequest request,
                 List<string> uploadedFilePaths);
        Task<IEnumerable<AccountingServiceRequest>> GetByUserAsync(string userId);
        Task<AccountingServiceRequest> GetByIdAsync(Guid id);
    }
}
