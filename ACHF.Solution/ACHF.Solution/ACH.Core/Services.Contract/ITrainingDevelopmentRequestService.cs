using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface ITrainingDevelopmentRequestService
    {
        Task<TrainingDevelopmentRequest> CreateAsync(string userId, TrainingDevelopmentRequest request);
         Task<TrainingDevelopmentRequest?> GetByIdAsync(Guid id);

        Task<IEnumerable<TrainingDevelopmentRequest>> GetByUserAsync(string userId);
    }
}
