using ACH.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ACH.Core.Services.Contract
{
    public interface IPaymentService
    {
        Task<PaymentResult> CreatePaymentIntentAsync(Guid requestId, string userId);
    //    Task<PaymentResult> ConfirmPaymentAsync(string paymentIntentId);
        Task<bool> HandleWebhookAsync(string json, string stripeSignature);
        Task<PaymentResult> RefundPaymentAsync(string paymentIntentId);
        Task<PaymentStatisticsDto> GetPaymentStatisticsAsync();
    }
}
