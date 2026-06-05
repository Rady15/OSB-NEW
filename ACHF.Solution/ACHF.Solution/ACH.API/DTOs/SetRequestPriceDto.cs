namespace ACH.API.DTOs
{
    public class SetRequestPriceDto
    {
        public Guid RequestId { get; set; }
        public decimal Price { get; set; }
    }

}
