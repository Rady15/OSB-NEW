using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class InsuranceServiceRequest : BaseEntity
    {
        public InsuranceServiceType ServiceType { get; set; }

        public string EmployeeName { get; set; }
        public string NationalId { get; set; }
        public DateTime BirthDate { get; set; }

        public decimal BasicSalary { get; set; }
        public DateTime EmploymentDate { get; set; }
        public Guid RequestId { get; set; }

        public Request Request { get; set; }
    }
}
