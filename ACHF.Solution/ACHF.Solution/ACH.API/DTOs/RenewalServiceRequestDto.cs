namespace ACH.API.DTOs
{
    public class RenewalServiceRequestDto
    {
        public Guid RequestId { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string RequestCode { get; set; }

        public List<string> FileUrls { get; set; } = new List<string>();
    }

}
