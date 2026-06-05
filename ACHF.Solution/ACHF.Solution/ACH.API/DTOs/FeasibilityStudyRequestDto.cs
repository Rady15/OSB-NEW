using ACH.Core.Entities;

namespace ACH.API.DTOs
{

    public class FeasibilityStudyRequestDto
    {
        public Guid Id { get; set; }
        public string StudyType { get; set; } 
        public string ProjectName { get; set; }
        public string ActivityType { get; set; }
        public string Location { get; set; }
        public string RequestCode { get; set; }

        public decimal ProposedCapital { get; set; }
        public List<string> FileUrls { get; set; } = new List<string>();
        public string UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public Guid RequestId { get; set; }
        public string ServiceType { get; set; }
    }
}
