using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class LicenseServiceRequest : BaseEntity
    {
        public LicenseType LicenseType { get; set; }

        public Guid RequestId { get; set; }

        public Request Request { get; set; }
    }
}
