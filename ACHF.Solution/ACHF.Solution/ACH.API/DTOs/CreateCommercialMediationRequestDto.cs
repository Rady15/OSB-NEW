using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateCommercialMediationRequestDto
    {
        public CommercialMediationType MediationType { get; set; }
        public string DisputeDescription { get; set; }
        public decimal DisputeValue { get; set; }
        public DateTime StartDate { get; set; }
        public string PartiesInvolved { get; set; }

        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }
}
