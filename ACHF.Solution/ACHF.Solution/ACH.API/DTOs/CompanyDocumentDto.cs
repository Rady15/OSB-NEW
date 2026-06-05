namespace ACH.API.DTOs
{
    public class CompanyDocumentDto
    {
        public Guid Id { get; set; }
        public string CompanyName { get; set; }
        public string UserId { get; set; }
        public string OriginalFileName { get; set; }
        public string FileUrl { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Description { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
