using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class InternationalServiceRequest:BaseEntity
    {
        
        public InternationalServiceType ServiceType { get; set; } 
        public string Country { get; set; }                        
        public string ProposedActivity { get; set; }            
        public decimal Capital { get; set; }
        public Guid RequestId { get; set; }

        public Request Request { get; set; }

    }
}
