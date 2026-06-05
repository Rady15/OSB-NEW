using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class MarketResearchRequestService : IMarketResearchRequestService
{
    private readonly IUnitOfWork _unitOfWork;

    public MarketResearchRequestService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MarketResearchRequest> CreateAsync(string userId, MarketResearchRequest request)
    {
        var generalRequest = new Request
        {
            UserId = userId,
            ServiceType = ServiceType.MarketResearch,
            Status = RequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            RequestCode = GenerateRequestCode()

        };

        request.Request = generalRequest;

        await _unitOfWork.Repository<MarketResearchRequest>().AddAsync(request);
        await _unitOfWork.CompleteAsync();

        return request;
    }

    public async Task<IEnumerable<MarketResearchRequest>> GetByUserAsync(string userId)
    {
        return await _unitOfWork.Repository<MarketResearchRequest>()
            .GetQueryable()
            .Include(m => m.Request)
            .Where(m => m.Request.UserId == userId)
            .ToListAsync();
    }
    private string GenerateRequestCode()
    {
        var random = new Random();
        var number = random.Next(10000, 99999);
        return $"ACH{number}";
    }
    public async Task<MarketResearchRequest?> GetByIdAsync(Guid id)
    {
        return await _unitOfWork.Repository<MarketResearchRequest>()
            .GetQueryable()
            .Include(m => m.Request)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<IEnumerable<MarketResearchRequest>> GetAllAsync()
    {
        return await _unitOfWork.Repository<MarketResearchRequest>()
            .GetQueryable()
            .Include(m => m.Request)
            .OrderByDescending(m => m.Request.CreatedAt)
            .ToListAsync();
    }

}