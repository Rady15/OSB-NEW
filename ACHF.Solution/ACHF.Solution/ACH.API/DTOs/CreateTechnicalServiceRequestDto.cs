using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateTechnicalServiceRequestDto
    {

        public string ProjectDescription { get; set; }
        public string Platform { get; set; }
        public TechnicalServiceType ServiceType { get; set; }
        public decimal BudgetInSAR { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    }

