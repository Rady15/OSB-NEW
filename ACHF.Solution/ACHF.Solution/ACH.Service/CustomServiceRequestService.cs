using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class CustomServiceRequestService : ICustomServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CustomServiceRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<CustomServiceRequest> CreateAsync(string userId, CustomServiceRequest request)
        {
            var generalRequest = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.Custom, 
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RequestCode = GenerateRequestCode()

            };

            request.Request = generalRequest;

            await _unitOfWork.Repository<CustomServiceRequest>().AddAsync(request);
            await _unitOfWork.CompleteAsync();

            return request;
        }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }
        public async Task<IEnumerable<CustomServiceRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<CustomServiceRequest>()
                .GetQueryable()
                .Include(c => c.Request)
                .Where(c => c.Request.UserId == userId)
                .ToListAsync();
        }

        public async Task<CustomServiceRequest?> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<CustomServiceRequest>()
                .GetQueryable()
                .Include(c => c.Request)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

    }
}
