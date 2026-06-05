using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class ServiceFile:BaseEntity
    {
        public string FileUrl { get; set; }
     //   public Guid ServiceRequestId { get; set; }
        public Request Request { get; set; }
    }
}
