using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class AccountingServiceRequest : BaseEntity
    {
        public AccountingServiceType ServiceType { get; set; } 
        public string Description { get; set; }               
        public string FiscalYear { get; set; }
        public Guid RequestId { get; set; }

        public Request Request { get; set; }
    }
}
