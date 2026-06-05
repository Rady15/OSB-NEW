using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class FeasibilityStudyRequest : BaseEntity
    {
        public FeasibilityStudyType StudyType { get; set; } 
        public string ProjectName { get; set; }
        public string ActivityType { get; set; }
        public string Location { get; set; }
        public decimal ProposedCapital { get; set; }
        public Guid RequestId { get; set; }

        public Request Request { get; set; }
    }
}
