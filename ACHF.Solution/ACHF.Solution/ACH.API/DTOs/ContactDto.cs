using System.ComponentModel.DataAnnotations;

namespace ACH.API.DTOs
{
    public class ContactDto
    {
        [Required]
        public string Name { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Subject { get; set; }

        [Required]
        public string Message { get; set; }

        public string phoneNumber { get; set; }
    }

}
