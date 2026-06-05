using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class InsuranceServiceRequestService : IInsuranceServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public InsuranceServiceRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

       
        public async Task<InsuranceServiceRequest> CreateAsync(string userId,
            InsuranceServiceRequest request,
            List<string> uploadedFilePaths)
        {
            var generalRequest = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.Insurance,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RequestCode = GenerateRequestCode()

            };

            if (uploadedFilePaths != null && uploadedFilePaths.Any())
            {
                generalRequest.Files = uploadedFilePaths.Select(p => new ServiceFile
                {
                    FileUrl = p
                }).ToList();
            }

            request.Request = generalRequest;

            await _unitOfWork.Repository<InsuranceServiceRequest>().AddAsync(request);
            await _unitOfWork.CompleteAsync();

            return request;
        }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }

        public async Task<IEnumerable<InsuranceServiceRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<InsuranceServiceRequest>()
                .GetQueryable()
                .Include(r => r.Request)
                    .ThenInclude(rq => rq.Files)
                .Where(r => r.Request.UserId == userId)
                .ToListAsync();
        }

        public async Task<InsuranceServiceRequest> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<InsuranceServiceRequest>()
                .GetQueryable()
                .Include(r => r.Request)
                    .ThenInclude(rq => rq.Files)
                .FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
