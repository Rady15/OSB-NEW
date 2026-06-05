namespace ACH.API.DTOs
{
    public class LaborOfficeServiceRequestDto
    {
        public Guid Id { get; set; }
        public string ServiceType { get; set; }

        public string WorkerName { get; set; }
        public string IqamaNumber { get; set; }
        public string Nationality { get; set; }
        public string Profession { get; set; }
        public DateTime IqamaExpiryDate { get; set; }
        public string RequestCode { get; set; }

        public List<string> FileUrls { get; set; } = new();
        public string UserId { get; set; }
        public Guid RequestId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public string LaborType { get; set; }


    }
}
