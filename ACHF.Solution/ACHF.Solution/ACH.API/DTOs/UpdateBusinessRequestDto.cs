using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class UpdateBusinessRequestDto
    {
        public Guid Id { get; set; }
        public UpdateType UpdateType { get; set; }

        public string NewAddress { get; set; }
        public string NewLegalRepName { get; set; }
        public string NewLegalRepIdNumber { get; set; }
        public string RequestCode { get; set; }

        public Guid RequestId { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<string> FileUrls { get; set; } = new List<string>();
    }
}
