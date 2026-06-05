using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IZakatIncomeServiceRequestService
    {
        Task<ZakatIncomeServiceRequest> CreateAsync(string userId, ZakatIncomeServiceRequest zakatRequest, List<string> uploadedFilePaths);

        Task<IEnumerable<ZakatIncomeServiceRequest>> GetByUserAsync(string userId);
        Task<ZakatIncomeServiceRequest?> GetByIdAsync(Guid id);
        //Task<List<string>> GetFileUrlsAsync(Guid requestId);
    }
}
