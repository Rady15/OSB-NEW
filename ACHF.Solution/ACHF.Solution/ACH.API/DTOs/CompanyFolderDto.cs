namespace ACH.API.DTOs
{
    public class CompanyFolderDto
    {
        public string CompanyName { get; set; }
        public int DocumentCount { get; set; }
        public List<CompanyDocumentDto> Documents { get; set; } = new();
    }
}
