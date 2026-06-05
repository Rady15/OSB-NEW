using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.EntityFrameworkCore;

public class LegalServiceRequestService : ILegalServiceRequestService
{
    private readonly IUnitOfWork _unitOfWork;

    public LegalServiceRequestService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<LegalServiceRequest> CreateAsync(string userId,LegalServiceRequest legalRequest, List<string> uploadedFilePaths)
    {
        var request = new Request
        {
            UserId = userId,
            ServiceType = ServiceType.Legal,
            Status = RequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            RequestCode = GenerateRequestCode()

        };

        request.Files = uploadedFilePaths.Select(p => new ServiceFile
        {
            FileUrl = p
        }).ToList();

        legalRequest.Request = request;

        await _unitOfWork.Repository<LegalServiceRequest>().AddAsync(legalRequest);
        await _unitOfWork.CompleteAsync();

        return legalRequest;
    }
    private string GenerateRequestCode()
    {
        var random = new Random();
        var number = random.Next(10000, 99999); 
        return $"ACH{number}";
    }
    public async Task<IEnumerable<LegalServiceRequest>> GetByUserAsync(string userId)
    {
        return await _unitOfWork.Repository<LegalServiceRequest>()
            .GetQueryable()
            .Include(l => l.Request)
                .ThenInclude(r => r.Files)
            .Where(l => l.Request.UserId == userId)
            .ToListAsync();
    }

    public async Task<LegalServiceRequest?> GetByIdAsync(Guid id)
    {
        return await _unitOfWork.Repository<LegalServiceRequest>()
            .GetQueryable()
            .Include(l => l.Request)
                .ThenInclude(r => r.Files)
            .FirstOrDefaultAsync(l => l.Id == id);
    }
}
