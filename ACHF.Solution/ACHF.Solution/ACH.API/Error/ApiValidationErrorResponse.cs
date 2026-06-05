namespace ACH.API.Error
{
    public class ApiValidationErrorResponse : ApiResponse
    {
        public ApiValidationErrorResponse() : base(400)
        {
            Errors = new List<string>();
        }

        public IEnumerable<string> Errors { get; set; }
    }
}
