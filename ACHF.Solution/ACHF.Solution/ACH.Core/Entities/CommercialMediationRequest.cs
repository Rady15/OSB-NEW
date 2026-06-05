using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class CommercialMediationRequest : BaseEntity
    {
        public CommercialMediationType MediationType { get; set; }
        public string DisputeDescription { get; set; }
        public decimal DisputeValue { get; set; } 
        public DateTime StartDate { get; set; }
        public string PartiesInvolved { get; set; }
        public Guid RequestId { get; set; }

        public Request Request { get; set; }
    }
}
