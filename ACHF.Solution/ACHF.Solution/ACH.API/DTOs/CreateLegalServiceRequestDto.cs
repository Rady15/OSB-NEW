using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateLegalServiceRequestDto
    {
        public LegalServiceType ServiceType { get; set; }
        public string RequestDetails { get; set; }
        public string LegalField { get; set; }

        public List<IFormFile> Files { get; set; } = new();
    }
}
