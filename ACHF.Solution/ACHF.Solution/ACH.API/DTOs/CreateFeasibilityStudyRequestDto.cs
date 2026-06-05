using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateFeasibilityStudyRequestDto
    {
        public FeasibilityStudyType StudyType { get; set; }
        public string ProjectName { get; set; }
        public string ActivityType { get; set; }
        public string Location { get; set; }
        public decimal ProposedCapital { get; set; }
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();
    }
}
