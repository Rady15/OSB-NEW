using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateUpdateBusinessRequestDto
    {
        public UpdateType UpdateType { get; set; }

        public string NewAddress { get; set; }
        public string NewLegalRepName { get; set; }
        public string NewLegalRepIdNumber { get; set; }
      
        public List<IFormFile> Documents { get; set; } = new List<IFormFile>();
    }
}
