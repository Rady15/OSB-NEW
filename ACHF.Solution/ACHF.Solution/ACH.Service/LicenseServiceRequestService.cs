using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class LicenseServiceRequestService : ILicenseServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public LicenseServiceRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

      
        public async Task<LicenseServiceRequest> CreateAsync(string userId, LicenseServiceRequest licenseRequest, List<string> uploadedFilePaths)
        {
            var request = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.License,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RequestCode = GenerateRequestCode()

            };

            request.Files = uploadedFilePaths?.Select(p => new ServiceFile
            {
                FileUrl = p,
            }).ToList() ?? new List<ServiceFile>();

            licenseRequest.Request = request;

            await _unitOfWork.Repository<LicenseServiceRequest>().AddAsync(licenseRequest);
            await _unitOfWork.CompleteAsync();

            return licenseRequest;
        }

      
        public async Task<IEnumerable<LicenseServiceRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<LicenseServiceRequest>()
                .GetQueryable()
                .Include(l => l.Request)
                    .ThenInclude(r => r.Files)
                .Where(l => l.Request.UserId == userId)
                .OrderByDescending(l => l.Request.CreatedAt)
                .ToListAsync();
        }

    
        public async Task<IEnumerable<LicenseServiceRequest>> GetAllAsync()
        {
            return await _unitOfWork.Repository<LicenseServiceRequest>()
                .GetQueryable()
                .Include(l => l.Request)
                    .ThenInclude(r => r.Files)
                .OrderByDescending(l => l.Request.CreatedAt)
                .ToListAsync();
        }

        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }
        public async Task<LicenseServiceRequest?> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<LicenseServiceRequest>()
                .GetQueryable()
                .Include(l => l.Request)
                    .ThenInclude(r => r.Files)
                .FirstOrDefaultAsync(l => l.Id == id);
        }
    }
}
