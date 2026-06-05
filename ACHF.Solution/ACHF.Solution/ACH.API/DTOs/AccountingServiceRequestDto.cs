using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class AccountingServiceRequestDto
    {
        public Guid Id { get; set; }
        public AccountingServiceType ServiceType { get; set; }
        public string Description { get; set; }
        public string FiscalYear { get; set; }

        public List<string> FileUrls { get; set; } = new();
        public string RequestCode { get; set; }
        public string UserId { get; set; }
        public Guid RequestId { get; set; }
        public string RequestType { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
