using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class UserFullServiceRequest
    {
        public Guid RequestId { get; set; }
        public string ServiceType { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? AssignedEmployeeUserId { get; set; }
        public List<string> FileUrls { get; set; } = new();
        public string userId { get; set; }
        public object? ServiceDetails { get; set; }
        public decimal? Price { get; set; }
    }

}
