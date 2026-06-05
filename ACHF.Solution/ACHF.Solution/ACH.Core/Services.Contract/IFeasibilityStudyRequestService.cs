using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IFeasibilityStudyRequestService
    {
        Task<FeasibilityStudyRequest> CreateAsync(string userId,
             FeasibilityStudyRequest request,
             List<string> uploadedFilePaths);
        Task<IEnumerable<FeasibilityStudyRequest>> GetByUserAsync(string userId);
        Task<FeasibilityStudyRequest> GetByIdAsync(Guid id);
    }
}
