using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class LegalServiceRequestDto
    {
        public Guid Id { get; set; }
        public string ServiceType { get; set; }
        public string RequestDetails { get; set; }
        public string LegalField { get; set; }
        public string RequestCode { get; set; }

        public List<string> FileUrls { get; set; } = new();
        public string UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid RequestId { get; set; }
        public string Status { get; set; }
        public string LegalType { get; set; }


    }
}
