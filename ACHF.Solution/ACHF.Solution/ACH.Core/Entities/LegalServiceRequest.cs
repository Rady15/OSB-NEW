using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class LegalServiceRequest : BaseEntity
    {
        public LegalServiceType ServiceType { get; set; }

        public string RequestDetails { get; set; }  
        public string LegalField { get; set; }

        //  public ICollection<ServiceFile> Files { get; set; }   = new List<ServiceFile>();

        public Guid RequestId { get; set; }
        public Request Request { get; set; }
    }
}
