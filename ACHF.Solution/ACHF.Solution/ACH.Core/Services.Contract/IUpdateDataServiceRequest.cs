using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IUpdateDataServiceRequest
    {
        Task<UpdateDataServiceRequest> CreateAsync(string userId, UpdateDataServiceRequest request, List<string> uploadedFilePaths);
        Task<IEnumerable<UpdateDataServiceRequest>> GetByUserAsync(string userId);
        Task<UpdateDataServiceRequest?> GetByIdAsync(Guid id);
    }
}
