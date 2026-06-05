using ACH.API.DTOs;
using ACH.API.Helpers;
using ACH.Core.Entities.Identity;
using ACH.Core.Services.Contract;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ACH.API.Controllers
{
    [Authorize]
    public class CompanyDocumentsController : BaseApiController
    {
        private readonly ICompanyDocumentService _service;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;

        public CompanyDocumentsController(
            ICompanyDocumentService service,
            IMapper mapper,
            UserManager<AppUser> userManager)
        {
            _service = service;
            _mapper = mapper;
            _userManager = userManager;
        }

        [HttpPost("upload")]
        public async Task<ActionResult<CompanyDocumentDto>> Upload([FromForm] UploadCompanyDocumentDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return Unauthorized();

            if (string.IsNullOrWhiteSpace(user.CompanyName))
                return BadRequest(new { message = "Your account has no company name set." });

            var fileUrl = DocumentSettings.UploadCompanyFile(dto.File, user.CompanyName);

            var doc = await _service.UploadAsync(
                userId,
                user.CompanyName,
                dto.File.FileName,
                fileUrl,
                dto.IssueDate,
                dto.ExpiryDate,
                dto.Description);

            return Ok(_mapper.Map<CompanyDocumentDto>(doc));
        }

        [HttpGet("my-documents")]
        public async Task<ActionResult<object>> MyDocuments()
        {
            var userId = User.FindFirstValue(ClaimTypes.GivenName);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId); 
            if (user == null) return Unauthorized();

            var companyDocs = new List<CompanyDocumentDto>();
            if (!string.IsNullOrWhiteSpace(user.CompanyName))
            {
                var docs = await _service.GetByCompanyAsync(user.CompanyName);
                companyDocs = _mapper.Map<List<CompanyDocumentDto>>(docs);
            }

            var serviceFiles = await _service.GetServiceFilesByUserAsync(userId);
            var serviceFileDtos = serviceFiles.Select(f => new CompanyDocumentDto
            {
                Id = f.Id,
                CompanyName = user.CompanyName ?? "",
                UserId = userId,
                OriginalFileName = f.FileUrl.Split('/').Last(),
                FileUrl = f.FileUrl,
                UploadedAt = f.Request?.CreatedAt ?? DateTime.UtcNow
            }).ToList();

            return Ok(new
            {
                UploadedDocuments = companyDocs,
                ServiceDocuments = serviceFileDtos
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CompanyDocumentDto>> GetById(Guid id)
        {
            var doc = await _service.GetByIdAsync(id);
            if (doc == null) return NotFound();

            if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))
            {
                var userId = User.FindFirstValue(ClaimTypes.GivenName);
                var user = await _userManager.FindByIdAsync(userId!); 
                if (user == null || user.CompanyName != doc.CompanyName) return Forbid();
            }

            return Ok(_mapper.Map<CompanyDocumentDto>(doc));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var doc = await _service.GetByIdAsync(id);
            if (doc == null) return NotFound();

            if (!User.IsInRole("Admin"))
            {
                var userId = User.FindFirstValue(ClaimTypes.GivenName);
                if (doc.UserId != userId) return Forbid();
            }

            await _service.DeleteAsync(id);
            return Ok(new { message = "Document deleted successfully." });
        }

        [HttpGet("admin/all-companies")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<CompanyFolderDto>>> AllCompanies()
        {
            var companyUsers = await _service.GetAllCompanyUsersAsync();
            var allCompanyDocs = await _service.GetAllGroupedByCompanyAsync();
            var allServiceFiles = await _service.GetAllServiceFilesAsync();

            var companyDocsDict = allCompanyDocs.ToDictionary(g => g.Key, g => g.ToList());

            var result = companyUsers.Select(cu =>
            {
                var uploadedDocs = companyDocsDict.ContainsKey(cu.CompanyName)
                    ? _mapper.Map<List<CompanyDocumentDto>>(companyDocsDict[cu.CompanyName])
                    : new List<CompanyDocumentDto>();

                var serviceDocs = allServiceFiles
                    .Where(f => f.Request != null && cu.UserNames.Contains(f.Request.UserId))
                    .Select(f => new CompanyDocumentDto
                    {
                        Id = f.Id,
                        CompanyName = cu.CompanyName,
                        UserId = f.Request.UserId,
                        OriginalFileName = f.FileUrl.Split('/').Last(),
                        FileUrl = f.FileUrl,
                        UploadedAt = f.Request.CreatedAt
                    }).ToList();

                var allDocs = uploadedDocs.Concat(serviceDocs)
                    .OrderByDescending(d => d.UploadedAt)
                    .ToList();

                return new CompanyFolderDto
                {
                    CompanyName = cu.CompanyName,
                    DocumentCount = allDocs.Count,
                    Documents = allDocs
                };
            })
            .Where(f => f.DocumentCount > 0)
            .ToList();

            return Ok(result);
        }

        [HttpGet("admin/company/{companyName}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<IEnumerable<CompanyDocumentDto>>> ByCompany(string companyName)
        {
            var docs = await _service.GetByCompanyAsync(companyName);
            return Ok(_mapper.Map<IEnumerable<CompanyDocumentDto>>(docs));
        }
    }
}