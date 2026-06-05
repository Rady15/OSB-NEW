using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class ChamberOfCommerceServiceRequestService : IChamberOfCommerceServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChamberOfCommerceServiceRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

       
        public async Task<ChamberOfCommerceServiceRequest> CreateAsync(
            string userId,
            ChamberOfCommerceServiceRequest request,
            List<string> uploadedFilePaths)
        {
            var generalRequest = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.ChamberOfCommerce,
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

            await _unitOfWork.Repository<ChamberOfCommerceServiceRequest>().AddAsync(request);
            await _unitOfWork.CompleteAsync();

            return request;
        }

        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }
        public async Task<IEnumerable<ChamberOfCommerceServiceRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<ChamberOfCommerceServiceRequest>()
                .GetQueryable()
                .Include(x => x.Request)
                .ThenInclude(r => r.Files)
                .Where(x => x.Request.UserId == userId)
                .ToListAsync();
        }


        public async Task<ChamberOfCommerceServiceRequest> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<ChamberOfCommerceServiceRequest>()
                .GetQueryable()
                .Include(x => x.Request)
                .ThenInclude(r => r.Files)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}