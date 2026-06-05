using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateInternationalServiceRequestDto
    {
        public string ServiceType { get; set; }
        public string Country { get; set; }
        public string ProposedActivity { get; set; }
        public decimal Capital { get; set; }
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }
}
