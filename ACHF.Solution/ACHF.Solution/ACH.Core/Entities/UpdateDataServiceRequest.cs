using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class UpdateDataServiceRequest:BaseEntity
    {


        public UpdateType UpdateType { get; set; }

        public string NewAddress { get; set; } 
        public string NewLegalRepName { get; set; } 
        public string NewLegalRepIdNumber { get; set; } 

        public Guid RequestId { get; set; }

        public Request Request { get; set; }
    }
}
