using ACH.Core.Entities.Identity;
using ACH.Core.Services.Contract;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class EmployeeService: IEmployeeService
    {
        private readonly UserManager<AppUser> _userManager;
       
        private readonly IUnitOfWork _unitOfWork;
        public EmployeeService(IUnitOfWork unitOfWork, UserManager<AppUser> userManager)
        {
            _userManager = userManager;
            _unitOfWork = unitOfWork;
        }
        public async Task<List<AppUser>> GetAllEmployeesAsync()
        {
            var employees = await _userManager.GetUsersInRoleAsync("Staff");
            return employees.ToList();
        }

    }
}
