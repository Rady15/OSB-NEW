using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Metrics;

namespace ACH.API.DTOs
{
    public class RegisterDto
    {

        [Required]
        public string UserName { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
        [Required]
        [Compare(nameof(Password), ErrorMessage = "Password and Confirm Password do not match")]
        public string PasswordConfirmation { get; set; }
        public string PhoneNumber { get; set; }
        public IFormFile? ProfileImage { get; set; }
        public string? CompanyName { get; set; }
    }
}
