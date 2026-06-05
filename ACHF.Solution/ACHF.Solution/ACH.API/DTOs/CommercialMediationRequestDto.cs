using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CommercialMediationRequestDto
    {
        public Guid Id { get; set; }
        public CommercialMediationType MediationType { get; set; }
        public string DisputeDescription { get; set; }
        public decimal DisputeValue { get; set; }
        public DateTime StartDate { get; set; }
        public string RequestCode { get; set; }

        public string PartiesInvolved { get; set; }
        public List<string> FileUrls { get; set; } = new List<string>();
        public string UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public Guid RequestId { get; set; }
        public string RequestType { get; set; }
    }
}
