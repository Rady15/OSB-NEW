using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class ZakatIncomeServiceRequestService : IZakatIncomeServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ZakatIncomeServiceRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ZakatIncomeServiceRequest> CreateAsync(string userId, ZakatIncomeServiceRequest zakatRequest, List<string> uploadedFilePaths)
        {
            var request = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.Zakat,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RequestCode = GenerateRequestCode()

            };

            request.Files = uploadedFilePaths.Select(p => new ServiceFile
            {
                FileUrl = p,
            }).ToList();

            zakatRequest.Request = request;

            await _unitOfWork.Repository<ZakatIncomeServiceRequest>().AddAsync(zakatRequest);

            await _unitOfWork.CompleteAsync();

            return zakatRequest;
        }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }
        public async Task<IEnumerable<ZakatIncomeServiceRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<ZakatIncomeServiceRequest>()
                .GetQueryable()
                .Include(z => z.Request)
                    .ThenInclude(r => r.Files) 
                .Where(z => z.Request.UserId == userId)
                .ToListAsync();
        }

        public async Task<ZakatIncomeServiceRequest?> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<ZakatIncomeServiceRequest>()
                .GetQueryable()
                .Include(z => z.Request)
                    .ThenInclude(r => r.Files) 
                .FirstOrDefaultAsync(z => z.Id == id);
        }

        //public async Task<List<string>> GetFileUrlsAsync(Guid requestId)
        //{
        //    return await _unitOfWork.Repository<ServiceFile>()
        //        .GetQueryable()
        //       .Where(f => f.ServiceRequestId == requestId)
        //        .Select(f => f.FileUrl)
        //        .ToListAsync();
        //}
    }
}
