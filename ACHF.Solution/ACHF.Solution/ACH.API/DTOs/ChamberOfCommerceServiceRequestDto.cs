using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class ChamberOfCommerceServiceRequestDto
    {
        public Guid Id { get; set; }
        public ChamberOfCommerceServiceType ServiceType { get; set; }

        public string CommercialRegistrationNumber { get; set; }
        public string BusinessActivityType { get; set; }
        public int NumberOfEmployees { get; set; }
        public decimal Capital { get; set; }
        public string RequestCode { get; set; }

        public List<string> FileUrls { get; set; } = new();

        public string UserId { get; set; }
        public Guid RequestId { get; set; }
        public string RequestType { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
