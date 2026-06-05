using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface ITechnicalServiceRequestService
    {


        Task<TechnicalServiceRequest> CreateAsync(string userId, TechnicalServiceRequest request);
        Task<IEnumerable<TechnicalServiceRequest>> GetByUserAsync(string userId);
        Task<TechnicalServiceRequest?> GetByIdAsync(Guid id);
    }
}

