namespace ACH.API.DTOs
{
    public class TechnicalServiceRequestDto
    {
        public Guid Id { get; set; }
        public Guid RequestId { get; set; }

        public string UserId { get; set; } 
        public string ProjectDescription { get; set; }
        public string Platform { get; set; }
        public string RequestCode { get; set; }

        public decimal BudgetInSAR { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
    }
   
}
