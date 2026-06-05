using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateAccountingServiceRequestDto
    {
        public AccountingServiceType ServiceType { get; set; }
        public string Description { get; set; }
        public string FiscalYear { get; set; }
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }
}
