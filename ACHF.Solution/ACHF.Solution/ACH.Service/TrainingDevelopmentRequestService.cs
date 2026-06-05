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
    public class TrainingDevelopmentRequestService : ITrainingDevelopmentRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TrainingDevelopmentRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TrainingDevelopmentRequest> CreateAsync(string userId, TrainingDevelopmentRequest request)
        {
            var generalRequest = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.TrainingDevelopment,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RequestCode = GenerateRequestCode()

            };

            request.Request = generalRequest;

            await _unitOfWork.Repository<TrainingDevelopmentRequest>().AddAsync(request);
            await _unitOfWork.CompleteAsync();

            return request;
        }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }
        public async Task<IEnumerable<TrainingDevelopmentRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<TrainingDevelopmentRequest>()
                .GetQueryable()
                .Include(t => t.Request)
                .Where(t => t.Request.UserId == userId)
                .ToListAsync();
        }

        public async Task<TrainingDevelopmentRequest?> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<TrainingDevelopmentRequest>()
                .GetQueryable()
                .Include(t => t.Request)
                .FirstOrDefaultAsync(t => t.Id == id);
        }
    }
}