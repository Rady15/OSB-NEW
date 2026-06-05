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
    public class RenewalServiceRequestService : IRenewalServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RenewalServiceRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<RenewalServiceRequest> CreateAsync(string userId, List<string> uploadedFilePaths)
        {
            var request = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.Renewal,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RequestCode = GenerateRequestCode()

            };

            request.Files = uploadedFilePaths.Select(p => new ServiceFile
            {
                FileUrl = p,
            }).ToList();

            var renewalRequest = new RenewalServiceRequest
            {
                Request = request
            };

            await _unitOfWork.Repository<RenewalServiceRequest>().AddAsync(renewalRequest);
            await _unitOfWork.CompleteAsync();

            return renewalRequest;
        }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }
        public async Task<IEnumerable<RenewalServiceRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<RenewalServiceRequest>()
                .GetQueryable()
                .Include(r => r.Request)
                    .ThenInclude(req => req.Files)
                .Where(r => r.Request.UserId == userId)
                .ToListAsync();
        }

        public async Task<RenewalServiceRequest?> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<RenewalServiceRequest>()
                .GetQueryable()
                .Include(r => r.Request)
                    .ThenInclude(req => req.Files)
                .FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
