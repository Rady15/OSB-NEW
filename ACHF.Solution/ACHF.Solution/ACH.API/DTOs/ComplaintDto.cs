using ACH.Core.Entities;
using System.ComponentModel.DataAnnotations;

namespace ACH.API.DTOs
{
    public class ComplaintDto
    {
        [Required]
        public string Category { get; set; }

        [Required]
        public ComplaintPriority Priority { get; set; }

        [Required]
        public string Description { get; set; }
        public IFormFile? Attachment { get; set; }

    }

}
