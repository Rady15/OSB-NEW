using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ACH.Service
{
  
        public class AccountingServiceRequestService : IAccountingServiceRequestService
        {
            private readonly IUnitOfWork _unitOfWork;

            public AccountingServiceRequestService(IUnitOfWork unitOfWork)
            {
                _unitOfWork = unitOfWork;
            }

            
            public async Task<AccountingServiceRequest> CreateAsync(
                string userId,
                AccountingServiceRequest request,
                List<string> uploadedFilePaths)
            {
                var generalRequest = new Request
                {
                    UserId = userId,
                    ServiceType = ServiceType.Accounting,
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

                await _unitOfWork.Repository<AccountingServiceRequest>().AddAsync(request);
                await _unitOfWork.CompleteAsync();

                return request;
            }

            public async Task<IEnumerable<AccountingServiceRequest>> GetByUserAsync(string userId)
            {
                return await _unitOfWork.Repository<AccountingServiceRequest>()
                    .GetQueryable()
                    .Include(x => x.Request)
                    .ThenInclude(r => r.Files)
                    .Where(x => x.Request.UserId == userId)
                    .ToListAsync();
            }

         
            public async Task<AccountingServiceRequest> GetByIdAsync(Guid id)
            {
                return await _unitOfWork.Repository<AccountingServiceRequest>()
                    .GetQueryable()
                    .Include(x => x.Request)
                    .ThenInclude(r => r.Files)
                    .FirstOrDefaultAsync(x => x.Id == id);
            }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999);
            return $"ACH{number}";
        }
    }

    }
