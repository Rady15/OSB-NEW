using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Entities
{
    public class PaymentResult
    {
        public bool Success { get; set; }
        public string ClientSecret { get; set; }
        public string PaymentIntentId { get; set; }
        public string ErrorMessage { get; set; }
        public PaymentStatus Status { get; set; }
    }
}
