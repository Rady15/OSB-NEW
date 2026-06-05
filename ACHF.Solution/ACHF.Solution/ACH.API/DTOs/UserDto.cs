namespace ACH.API.DTOs
{
    public class UserDto
    {
        public string Token { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string? ProfileImageUrl { get; set; }
        public List<string> Roles { get; set; }
        public string? CompanyName { get; set; }
    }
}
