using System.ComponentModel.DataAnnotations;

namespace ACH.API.DTOs
{
    public class UploadCompanyDocumentDto
    {
        [Required]
        public IFormFile File { get; set; }
        public string? Description { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }
}
