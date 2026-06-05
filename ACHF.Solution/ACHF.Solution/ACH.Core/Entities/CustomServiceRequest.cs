using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class CustomServiceRequest:BaseEntity
    {

        public Guid RequestId { get; set; }
        public Request Request { get; set; }
        public string ServiceName { get; set; }
        public string Details { get; set; }
        public string ContactNumber { get; set; }
      
    }
}
