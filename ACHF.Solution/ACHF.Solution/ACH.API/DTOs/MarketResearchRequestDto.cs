using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class MarketResearchRequestDto
    {
        public Guid Id { get; set; }

        public MarketResearchType ResearchType { get; set; }
        public string RequestId { get; set; }
        public string ProductDetails { get; set; }
        public string RequestCode { get; set; }

        public string TargetMarket { get; set; }
        public string GeographicRegion { get; set; }
        public decimal Budget { get; set; }

        public string UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
    }

}
