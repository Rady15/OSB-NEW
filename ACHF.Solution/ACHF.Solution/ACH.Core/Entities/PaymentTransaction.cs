using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class PaymentTransaction : BaseEntity
    {
        public Guid RequestId { get; set; }
        public Request Request { get; set; }
        public string UserId { get; set; }
        public string StripePaymentIntentId { get; set; }
        public string StripeClientSecret { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "usd";
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }
    }

}
