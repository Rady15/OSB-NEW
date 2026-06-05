using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using ACH.Repository.Data;
using ACH.Repository.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class CompanyDocumentService : ICompanyDocumentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ACHContext _context;
        private readonly ApplicationDbContext _identityContext;

        public CompanyDocumentService(
            IUnitOfWork unitOfWork,
            ACHContext context,
            ApplicationDbContext identityContext)
        {
            _unitOfWork = unitOfWork;
            _context = context;
            _identityContext = identityContext;
        }

        public async Task<IEnumerable<CompanyDocument>> GetByCompanyAsync(string companyName)
        {
            return await _unitOfWork.Repository<CompanyDocument>()
                .GetQueryable()
                .Where(d => d.CompanyName == companyName)
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceFile>> GetServiceFilesByUserAsync(string userId)
        {
            return await _context.ServiceFiles
                .Include(f => f.Request)
                .Where(f => f.Request.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceFile>> GetAllServiceFilesAsync()
        {
            return await _context.ServiceFiles
                .Include(f => f.Request)
                .ToListAsync();
        }

        public async Task<IEnumerable<(string CompanyName, List<string> UserNames)>> GetAllCompanyUsersAsync()
        {
            var users = await _identityContext.Users
                .Where(u => u.CompanyName != null && u.CompanyName != "")
                .Select(u => new { u.UserName, u.CompanyName })
                .ToListAsync();

            return users
                .GroupBy(u => u.CompanyName)
                .Select(g => (CompanyName: g.Key, UserNames: g.Select(u => u.UserName).ToList()))
                .ToList();
        }

        public async Task<IEnumerable<IGrouping<string, CompanyDocument>>> GetAllGroupedByCompanyAsync()
        {
            var all = await _unitOfWork.Repository<CompanyDocument>()
                .GetQueryable()
                .OrderBy(d => d.CompanyName)
                .ThenByDescending(d => d.UploadedAt)
                .ToListAsync();
            return all.GroupBy(d => d.CompanyName);
        }

        public async Task<CompanyDocument?> GetByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<CompanyDocument>().GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var doc = await _unitOfWork.Repository<CompanyDocument>().GetByIdAsync(id);
            if (doc == null) return false;
            _unitOfWork.Repository<CompanyDocument>().Delete(doc);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<CompanyDocument> UploadAsync(
            string userId, string companyName, string originalFileName,
            string fileUrl, DateTime? issueDate, DateTime? expiryDate, string? description)
        {
            var doc = new CompanyDocument
            {
                UserId = userId,
                CompanyName = companyName,
                OriginalFileName = originalFileName,
                FileUrl = fileUrl,
                IssueDate = issueDate,
                ExpiryDate = expiryDate,
                Description = description,
                UploadedAt = DateTime.UtcNow
            };
            await _unitOfWork.Repository<CompanyDocument>().AddAsync(doc);
            await _unitOfWork.CompleteAsync();
            return doc;
        }
    }
}