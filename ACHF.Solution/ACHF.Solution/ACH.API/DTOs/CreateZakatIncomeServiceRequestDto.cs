namespace ACH.API.DTOs
{
    public class CreateZakatIncomeServiceRequestDto
    {
        public string ServiceType { get; set; }   

        public decimal AnnualRevenue { get; set; }
        public decimal Expenses { get; set; }
        public decimal Costs { get; set; }
        public decimal FixedAssets { get; set; }

        public string FiscalYear { get; set; }

        public List<IFormFile> Files { get; set; } = new();
    }
}
