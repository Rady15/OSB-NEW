using ACH.Core.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
   public interface IEmployeeService
    {
        Task<List<AppUser>> GetAllEmployeesAsync();

    }
}
