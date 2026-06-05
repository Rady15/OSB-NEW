namespace ACH.API.DTOs
{
    public class RequestDto
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string ServiceType { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string RequestCode { get; set; }
    }
}
