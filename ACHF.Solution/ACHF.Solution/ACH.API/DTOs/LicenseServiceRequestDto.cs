namespace ACH.API.DTOs
{
    public class LicenseServiceRequestDto
    {
        public Guid Id { get; set; }
       public string LicenseType { get; set; }
   public Guid RequestId { get; set; }
        public string UserId { get; set; }
        public List<string> FileUrls { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public string RequestCode { get; set; }

        public string ServiceType { get; set; }
    }
}
