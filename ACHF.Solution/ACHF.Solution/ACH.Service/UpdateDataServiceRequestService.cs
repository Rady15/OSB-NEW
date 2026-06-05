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
    public class UpdateDataServiceRequestService : IUpdateDataServiceRequest
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateDataServiceRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<UpdateDataServiceRequest> CreateAsync(string userId, UpdateDataServiceRequest request, List<string> uploadedFilePaths)
        {
            var generalRequest = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.UpdateData,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RequestCode = GenerateRequestCode(),
                Files = uploadedFilePaths.Select(p => new ServiceFile
                {
                    FileUrl = p
                }).ToList()
            };

            request.Request = generalRequest;

            await _unitOfWork.Repository<UpdateDataServiceRequest>().AddAsync(request);
            await _unitOfWork.CompleteAsync();

            return request;
        }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }
        public async Task<IEnumerable<UpdateDataServiceRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<UpdateDataServiceRequest>()
                .GetQueryable()
                .Include(r => r.Request)
                    .ThenInclude(r => r.Files)
                .Where(r => r.Request.UserId == userId)
                .ToListAsync();
        }

        public async Task<UpdateDataServiceRequest?> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<UpdateDataServiceRequest>()
                .GetQueryable()
                .Include(r => r.Request)
                    .ThenInclude(r => r.Files)
                .FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
