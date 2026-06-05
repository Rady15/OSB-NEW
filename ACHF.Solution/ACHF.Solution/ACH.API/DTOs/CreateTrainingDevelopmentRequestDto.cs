using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class CreateTrainingDevelopmentRequestDto
    {
        public TrainingCategory Category { get; set; }

        public string ProgramName { get; set; }

        public int ParticipantsCount { get; set; }

        public TrainingLevel Level { get; set; }

        public TrainingMethod Method { get; set; }
    }

}
