namespace ACH.API.DTOs
{

    public class CreateChamberOfCommerceServiceRequestDto
    {
        public string ServiceType { get; set; } 

        public string CommercialRegistrationNumber { get; set; }
        public string BusinessActivityType { get; set; }
        public int NumberOfEmployees { get; set; }
        public decimal Capital { get; set; }

        public List<IFormFile> Files { get; set; }
    }
}
