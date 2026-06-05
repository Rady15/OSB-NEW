using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class ZakatIncomeServiceRequest : BaseEntity
    {
        public Guid RequestId { get; set; } 

        public Request Request { get; set; } 

        public ZakatIncomeServiceType ServiceType { get; set; }
        public decimal AnnualRevenue { get; set; }
        public decimal Expenses { get; set; }
        public decimal Costs { get; set; }
        public decimal FixedAssets { get; set; }
        public string FiscalYear { get; set; }
    }

}
