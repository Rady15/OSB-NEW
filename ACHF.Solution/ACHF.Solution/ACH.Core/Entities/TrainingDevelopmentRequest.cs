using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class TrainingDevelopmentRequest : BaseEntity
    {
        public Guid RequestId { get; set; } 
        public Request Request { get; set; } 

        public TrainingCategory Category { get; set; }
        public string ProgramName { get; set; }
        public int ParticipantsCount { get; set; }
        public TrainingLevel Level { get; set; }
        public TrainingMethod Method { get; set; }
    }

}
