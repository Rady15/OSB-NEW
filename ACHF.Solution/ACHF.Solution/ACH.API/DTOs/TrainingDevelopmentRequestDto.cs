using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class TrainingDevelopmentRequestDto
    {
        public Guid Id { get; set; }

        public TrainingCategory Category { get; set; }

        public string ProgramName { get; set; }

        public int ParticipantsCount { get; set; }
        public string RequestCode { get; set; }


        public TrainingLevel Level { get; set; }

        public TrainingMethod Method { get; set; }

     public DateTime CreatedAt { get; set; }
        public Guid RequestId { get; set; }
        public string Status { get; set; }
    }

}
