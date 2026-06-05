using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class InsuranceServiceRequestDto
    {
        public Guid Id { get; set; }
        public InsuranceServiceType ServiceType { get; set; }

        public string EmployeeName { get; set; }
        public string NationalId { get; set; }
        public DateTime BirthDate { get; set; }
        public string RequestCode { get; set; }

        public decimal BasicSalary { get; set; }
        public DateTime EmploymentDate { get; set; }

        public List<string> FileUrls { get; set; } = new();
        public string UserId { get; set; }
        public DateTime CreatedAt { get; set;}
        public string Status { get; set; }
        public  Guid RequestId { get; set; }
        public string RequestType{ get; set; }
    }
}
