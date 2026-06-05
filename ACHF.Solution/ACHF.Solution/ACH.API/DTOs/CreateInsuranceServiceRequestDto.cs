using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateInsuranceServiceRequestDto
    {
        public string ServiceType { get; set; }

        public string EmployeeName { get; set; }
        public string NationalId { get; set; }
        public DateTime BirthDate { get; set; }

        public decimal BasicSalary { get; set; }
        public DateTime EmploymentDate { get; set; }

        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }
}
