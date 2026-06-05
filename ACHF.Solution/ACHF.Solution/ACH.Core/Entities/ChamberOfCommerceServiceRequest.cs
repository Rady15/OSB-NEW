using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class ChamberOfCommerceServiceRequest : BaseEntity
    {
        public ChamberOfCommerceServiceType ServiceType { get; set; }

        public string CommercialRegistrationNumber { get; set; }
        public string BusinessActivityType { get; set; }
        public int NumberOfEmployees { get; set; }
        public decimal Capital { get; set; }

      //  public string UserId { get; set; }
        public Guid RequestId { get; set; }

        public Request Request { get; set; }
    }
}
