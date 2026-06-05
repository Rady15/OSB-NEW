using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;

namespace ACH.Service
{
    public class FeasibilityStudyRequestService : IFeasibilityStudyRequestService
    {
        private readonly IUnitOfWork _unitOfWork;

        public FeasibilityStudyRequestService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        
        public async Task<FeasibilityStudyRequest> CreateAsync(
            string userId,
            FeasibilityStudyRequest request,
            List<string> uploadedFilePaths)
        {
            var generalRequest = new Request
            {
                UserId = userId,
                ServiceType = ServiceType.FeasibilityStudy,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Files = new List<ServiceFile>(),
                RequestCode = GenerateRequestCode()

            };

            if (uploadedFilePaths != null && uploadedFilePaths.Any())
            {
                foreach (var path in uploadedFilePaths)
                {
                    generalRequest.Files.Add(new ServiceFile
                    {
                        FileUrl = path,
                       
                    });
                }
            }

            request.Request = generalRequest;

            await _unitOfWork.Repository<FeasibilityStudyRequest>()
                .AddAsync(request);

            await _unitOfWork.CompleteAsync();

            return request;
        }
        private string GenerateRequestCode()
        {
            var random = new Random();
            var number = random.Next(10000, 99999); 
            return $"ACH{number}";
        }

        public async Task<IEnumerable<FeasibilityStudyRequest>> GetByUserAsync(string userId)
        {
            return await _unitOfWork.Repository<FeasibilityStudyRequest>()
                .GetQueryable()
                .Include(x => x.Request)
                    .ThenInclude(r => r.Files)
                .Where(x => x.Request.UserId == userId)
                .ToListAsync();
        }

      
        public async Task<FeasibilityStudyRequest> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<FeasibilityStudyRequest>()
                .GetQueryable()
                .Include(x => x.Request)
                    .ThenInclude(r => r.Files)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
