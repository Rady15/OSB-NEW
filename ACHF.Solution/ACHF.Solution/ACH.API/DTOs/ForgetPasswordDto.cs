using System.ComponentModel.DataAnnotations;

namespace ACH.API.DTOs
{
    public class ForgetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }


    }
}
