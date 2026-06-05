using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class LicenseIssuanceServiceRequestDto
    {
        public Guid Id { get; set; }
        public LicenseType LicenseType { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
