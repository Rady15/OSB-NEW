namespace ACH.API.DTOs
{
    public class CreateEmployeeDto
    {
        public string Email { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public string phoneNumber { get; set; }
    }
}
