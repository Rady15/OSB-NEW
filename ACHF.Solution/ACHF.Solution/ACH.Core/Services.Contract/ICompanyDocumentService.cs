using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface ICompanyDocumentService
    {
        Task<CompanyDocument> UploadAsync(
            string userId,
            string companyName,
            string originalFileName,
            string fileUrl,
            DateTime? issueDate,
            DateTime? expiryDate,
            string? description);

        Task<IEnumerable<CompanyDocument>> GetByCompanyAsync(string companyName);
        Task<IEnumerable<IGrouping<string, CompanyDocument>>> GetAllGroupedByCompanyAsync();
        Task<CompanyDocument?> GetByIdAsync(Guid id);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<ServiceFile>> GetServiceFilesByUserAsync(string userId);
        Task<IEnumerable<ServiceFile>> GetAllServiceFilesAsync();
        Task<IEnumerable<(string CompanyName, List<string> UserNames)>> GetAllCompanyUsersAsync();
    }
}
