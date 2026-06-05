using ACH.Core.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class Request : BaseEntity
    {
        public string UserId { get; set; }
        public ServiceType ServiceType { get; set; }
        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public decimal? Price { get; set; }
        public string? AssignedEmployeeUserId { get; set; }

       public string RequestCode { get; set; }

        //     public AppUser? AssignedEmployee { get; set; }
        public string? description { get; set; }
        public ICollection<ServiceFile> Files { get; set; } = new HashSet<ServiceFile>();
        public ZakatIncomeServiceRequest ZakatIncome { get; set; }
        public TrainingDevelopmentRequest Training { get; set; }
        public TechnicalServiceRequest Technical { get; set; }
        public ChamberOfCommerceServiceRequest ChamberOfCommerce { get; set; }
        public LicenseServiceRequest License { get; set; }
        public MarketResearchRequest MarketResearch { get; set; }
        public LegalServiceRequest Legal { get; set; }
       // public AppUser User { get; set; }
        public CustomServiceRequest Custom { get; set; }
        public LaborOfficeServiceRequest LaborOffice { get; set; }
        public InternationalServiceRequest International { get; set; }
        public InsuranceServiceRequest Insurance { get; set; }
        public FeasibilityStudyRequest FeasibilityStudy { get; set; }
        public CommercialMediationRequest CommercialMediation { get; set; }
        public AccountingServiceRequest Accounting { get; set; }
        public UpdateDataServiceRequest UpdateData { get; set; }
    }

}
