using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class InternationalServiceRequestService : IInternationalServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public InternationalServiceRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<InternationalServiceRequest> CreateAsync(
            string userId,
            InternationalServiceRequest request,
            List<string> uploadedFilePaths)
        {
            var generalRequest = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.International,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RequestCode = GenerateRequestCode()

            };

            generalRequest.Files = uploadedFilePaths.Select(path => new ServiceFile
            {
                FileUrl = path
            }).ToList();

            request.Request = generalRequest;

            await _unitOfWork.Repository<InternationalServiceRequest>().AddAsync(request);
            await _unitOfWork.CompleteAsync();

            return request;
        }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }

        public async Task<IEnumerable<InternationalServiceRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<InternationalServiceRequest>()
                .GetQueryable()
                .Include(r => r.Request)
                    .ThenInclude(req => req.Files)
                .Where(r => r.Request.UserId == userId)
                .ToListAsync();
        }

        public async Task<InternationalServiceRequest?> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<InternationalServiceRequest>()
                .GetQueryable()
                .Include(r => r.Request)
                    .ThenInclude(req => req.Files)
                .FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
