using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IRequestService
    {
        Task<List<UserFullServiceRequest>> GetUserServicesAsync(string userId);
        Task<IEnumerable<object>> GetAllZakatAsync();
        Task<Dictionary<string, int>> GetAllStatusCountsAsync();
        Task<List<Request>> GetAllRequestsAsync();
        Task<Request?> AddRequestDescriptionAsync(Guid requestId, string description);
            Task<List<UserFullServiceRequest>> GetAllRequestsWithDetailsAsync();
        Task<bool> SetRequestPriceAsync(Guid requestId, decimal price);
     Task<bool> AssignRequestToEmployee(Guid requestId, string employeeId);
      Task<List<UserFullServiceRequest>> GetEmployeeRequests(string employeeId);
        Task<bool> UpdateRequestStatusAsync(Guid requestId, RequestStatus newStatus);
        Task<Request> GetRequestByIdAsync(Guid requestId);

    }

}
