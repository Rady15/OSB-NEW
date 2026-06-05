namespace ACH.API.DTOs
{
    public class CustomServiceRequestDto
    {
        public Guid Id { get; set; }
        public string ServiceName { get; set; }
        public string Details { get; set; }
        public string ContactNumber { get; set; }
        public string UserId { get; set; }
        public string RequestCode { get; set; }

        public string RequestId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }

    }
}
