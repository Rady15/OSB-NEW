using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{

    public class CompanyDocument : BaseEntity
    {
        public string CompanyName { get; set; }
        public string UserId { get; set; }
        public string OriginalFileName { get; set; }
        public string FileUrl { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Description { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
