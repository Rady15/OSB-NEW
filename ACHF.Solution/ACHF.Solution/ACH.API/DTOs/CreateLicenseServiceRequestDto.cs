using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateLicenseServiceRequestDto
    {
        public LicenseType LicenseType { get; set; }

        public List<IFormFile> Documents { get; set; }
    }
}
