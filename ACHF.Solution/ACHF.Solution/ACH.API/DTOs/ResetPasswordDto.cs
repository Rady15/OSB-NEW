using System.ComponentModel.DataAnnotations;

namespace ACH.API.DTOs
{
    public class ResetPasswordDto
    {

        [Required]
        public string NewPassword { get; set; }

        [Required]
        [Compare(nameof(NewPassword))]
        public string ConfirmPassword { get; set; }
    }
}
