using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities.Identity
{
    public class AppUser: IdentityUser
    {
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? DeviceToken { get; set; }
        public string? FirebaseUid { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? CompanyName { get; set; }
        public string? RefreshToken { get; set; }

        public DateTime RefreshTokenExpiryTime { get; set; }

    }
}
