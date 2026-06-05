namespace ACH.API.DTOs
{
  
        public class ZakatIncomeServiceRequestDto
    {
            public Guid Id { get; set; }
            public decimal AnnualRevenue { get; set; }
            public decimal Expenses { get; set; }
            public decimal Costs { get; set; }
            public decimal FixedAssets { get; set; }
            public string FiscalYear { get; set; }
        public string RequestCode { get; set; }

        public List<string> FileUrls { get; set; } = new();
            public string ServiceType { get; set; }
            public DateTime CreatedAt { get; set; }
        public Guid RequestId { get; set; }
        public string Status { get; set; }
    }
    }

