using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IMarketResearchRequestService
    {
        Task<MarketResearchRequest?> GetByIdAsync(Guid id);
        Task<IEnumerable<MarketResearchRequest>> GetByUserAsync(string userId);
        Task<MarketResearchRequest> CreateAsync(string userId, MarketResearchRequest request); Task<IEnumerable<MarketResearchRequest>> GetAllAsync();
    }

}
