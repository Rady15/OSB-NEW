using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateMarketResearchRequestDto
    {
        public MarketResearchType ResearchType { get; set; }

        public string ProductDetails { get; set; }
        public string TargetMarket { get; set; }
        public string GeographicRegion { get; set; }
        public decimal Budget { get; set; }
    }

}
