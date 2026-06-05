using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;

namespace ACH.Service
{
    public class TechnicalServiceRequestService : ITechnicalServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TechnicalServiceRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TechnicalServiceRequest> CreateAsync(string userId, TechnicalServiceRequest request)
        {
            var generalRequest = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.Technical,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RequestCode = GenerateRequestCode()

            };

            request.Request = generalRequest;

            await _unitOfWork.Repository<TechnicalServiceRequest>().AddAsync(request);
            await _unitOfWork.CompleteAsync();

            return request;
        }

        public async Task<IEnumerable<TechnicalServiceRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<TechnicalServiceRequest>()
                .GetQueryable()
                .Include(t => t.Request)
                .Where(t => t.Request.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<TechnicalServiceRequest>> GetAllAsync()
        {
            return await _unitOfWork.Repository<TechnicalServiceRequest>()
                .GetQueryable()
                .Include(t => t.Request)
                .ToListAsync();
        }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }
        public async Task<TechnicalServiceRequest?> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<TechnicalServiceRequest>()
                .GetQueryable()
                .Include(t => t.Request)
                .FirstOrDefaultAsync(t => t.Id == id);
        }
    }
}
