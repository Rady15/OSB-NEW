using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface ILegalServiceRequestService
    {
        Task<LegalServiceRequest> CreateAsync(string userId, LegalServiceRequest legalRequest, List<string> uploadedFilePaths);
        Task<LegalServiceRequest?> GetByIdAsync(Guid id);
        Task<IEnumerable<LegalServiceRequest>> GetByUserAsync(string userId);

    }
}
