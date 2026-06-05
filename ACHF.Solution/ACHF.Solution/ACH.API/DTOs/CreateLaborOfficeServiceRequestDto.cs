namespace ACH.API.DTOs
{
    public class CreateLaborOfficeServiceRequestDto
    {
        public string ServiceType { get; set; }  
        public string WorkerName { get; set; }
        public string IqamaNumber { get; set; }
        public string Nationality { get; set; }
        public string Profession { get; set; }
        public DateTime IqamaExpiryDate { get; set; }

        public List<IFormFile> Files { get; set; } = new();
    }
}
