using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateLicenseIssuanceServiceRequestDto
    {
        public LicenseType LicenseType { get; set; }

        public List<IFormFile> Documents { get; set; }
    }
}
