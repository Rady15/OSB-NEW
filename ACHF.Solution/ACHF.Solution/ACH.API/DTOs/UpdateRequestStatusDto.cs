using ACH.Core.Entities;

namespace ACH.API.DTOs
{
    public class UpdateRequestStatusDto
    {
        public Guid RequestId { get; set; }
        public RequestStatus Status { get; set; }
    }
}
