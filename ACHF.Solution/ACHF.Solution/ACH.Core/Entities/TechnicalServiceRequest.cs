using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class TechnicalServiceRequest : BaseEntity
    {
        public Guid RequestId { get; set; }
        public Request Request { get; set; }

        public TechnicalServiceType ServiceType { get; set; }

        public string ProjectDescription { get; set; }
        public string Platform { get; set; }

        public decimal BudgetInSAR { get; set; }

        public DateTime CreatedAt { get; set; } 
    }
}
