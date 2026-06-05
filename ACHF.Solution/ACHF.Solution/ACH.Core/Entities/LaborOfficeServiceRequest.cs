using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class LaborOfficeServiceRequest : BaseEntity
    {
        public LaborOfficeServiceType ServiceType { get; set; }

        public string WorkerName { get; set; }
        public string IqamaNumber { get; set; }
        public string Nationality { get; set; }
        public string Profession { get; set; }
        public DateTime IqamaExpiryDate { get; set; }

        public Guid RequestId { get; set; }
        public Request Request { get; set; }
    }
}
