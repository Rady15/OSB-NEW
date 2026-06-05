using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class InternationalServiceRequestDto
    {
        public Guid Id { get; set; }
        public InternationalServiceType ServiceType { get; set; }
        public string Country { get; set; }
        public string ProposedActivity { get; set; }
        public string RequestCode { get; set; }

        public decimal Capital { get; set; }
        public List<string> FileUrls { get; set; } = new List<string>();
        public string UserId { get; set; }
        public Guid RequestId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public string RequestType { get; set; }
    }
}
