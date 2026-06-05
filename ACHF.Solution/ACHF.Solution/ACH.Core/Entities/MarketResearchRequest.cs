using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class MarketResearchRequest : BaseEntity
    {
        public MarketResearchType ResearchType { get; set; }

        public string ProductDetails { get; set; }
        public string TargetMarket { get; set; }
        public string GeographicRegion { get; set; }
        public decimal Budget { get; set; }

        public Guid RequestId { get; set; }

        public Request Request { get; set; }
    }

}
