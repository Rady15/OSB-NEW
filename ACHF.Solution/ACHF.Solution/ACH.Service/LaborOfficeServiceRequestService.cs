using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class LaborOfficeServiceRequestService : ILaborOfficeServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public LaborOfficeServiceRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<LaborOfficeServiceRequest> CreateAsync(string userId,
            LaborOfficeServiceRequest laborRequest,
            List<string> uploadedFilePaths)
        {
            var generalRequest = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.LaborOffice,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RequestCode = GenerateRequestCode()

            };

            generalRequest.Files = uploadedFilePaths.Select(p => new ServiceFile
            {
                FileUrl = p
            }).ToList();

            laborRequest.Request = generalRequest;

            await _unitOfWork.Repository<LaborOfficeServiceRequest>().AddAsync(laborRequest);
            await _unitOfWork.CompleteAsync();

            return laborRequest;
        }

        public async Task<IEnumerable<LaborOfficeServiceRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<LaborOfficeServiceRequest>()
                .GetQueryable()
                .Include(l => l.Request)
                    .ThenInclude(r => r.Files)
                .Where(l => l.Request.UserId == userId)
                .ToListAsync();
        }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }
        public async Task<LaborOfficeServiceRequest?> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<LaborOfficeServiceRequest>()
                .GetQueryable()
                .Include(l => l.Request)
                    .ThenInclude(r => r.Files)
                .FirstOrDefaultAsync(l => l.Id == id);
        }
    }
}
