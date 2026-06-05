using ACH.Core.Entities;
using ACH.Core.Services.Contract;
using ACH.Repository.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Stripe;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public PaymentService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            StripeConfiguration.ApiKey = _configuration["StripeSettings:SecretKey"];
        }
        public async Task<PaymentStatisticsDto> GetPaymentStatisticsAsync()
        {
            var payments = _unitOfWork.Repository<PaymentTransaction>()
                .GetQueryable();

            return new PaymentStatisticsDto
            {
                TotalPaidAmount = await payments
                    .Where(x => x.Status == PaymentStatus.Succeeded)
                    .SumAsync(x => x.Amount),

                TotalPendingAmount = await payments
                    .Where(x => x.Status == PaymentStatus.Pending)
                    .SumAsync(x => x.Amount),

                SuccessfulPayments = await payments
                    .CountAsync(x => x.Status == PaymentStatus.Succeeded),

                PendingPayments = await payments
                    .CountAsync(x => x.Status == PaymentStatus.Pending),

                FailedPayments = await payments
                    .CountAsync(x => x.Status == PaymentStatus.Failed),

                RefundedPayments = await payments
                    .CountAsync(x => x.Status == PaymentStatus.Refunded)
            };
        }
        public async Task<PaymentResult> CreatePaymentIntentAsync(Guid requestId, string userId)
        {
            var request = await _unitOfWork.Repository<Request>()
                .GetByIdAsync(requestId);

            if (request == null)
                return new PaymentResult { Success = false, ErrorMessage = "Request not found" };

            if (request.Price == null || request.Price <= 0)
                return new PaymentResult { Success = false, ErrorMessage = "Invalid price" };

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(request.Price.Value * 100),
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
                //AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                //{
                //    Enabled = true,
                //    AllowRedirects = "never"
                //},
                Metadata = new Dictionary<string, string>
                {
                    { "RequestId", requestId.ToString() },
                    { "UserId", userId },
                  //  { /*"RequestCode", request.RequestCode*/ }
                }
            };

            var stripeService = new PaymentIntentService();
            var paymentIntent = await stripeService.CreateAsync(options);

            var transaction = new PaymentTransaction
            {
                RequestId = request.Id,
                UserId = userId,
                StripePaymentIntentId = paymentIntent.Id,
                StripeClientSecret = paymentIntent.ClientSecret,
                Amount = request.Price.Value,
                Status = PaymentStatus.Pending
            };

            await _unitOfWork.Repository<PaymentTransaction>().AddAsync(transaction);
            await _unitOfWork.CompleteAsync();

            return new PaymentResult
            {
                Success = true,
                ClientSecret = paymentIntent.ClientSecret,
                PaymentIntentId = paymentIntent.Id,
                Status = PaymentStatus.Pending
            };
        }

        public async Task<bool> HandleWebhookAsync(string json, string stripeSignature)
        {
            var stripeEvent = JsonConvert.DeserializeObject<Event>(json);

            if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                await UpdatePaymentStatusAsync(paymentIntent.Id, PaymentStatus.Succeeded);
            }
            else if (stripeEvent.Type == EventTypes.PaymentIntentPaymentFailed)
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                await UpdatePaymentStatusAsync(paymentIntent.Id, PaymentStatus.Failed);
            }

            return true;
        }
        private async Task UpdatePaymentStatusAsync(string paymentIntentId, PaymentStatus status)
        {
            var transaction = await _unitOfWork.Repository<PaymentTransaction>()
     .GetQueryable()
     .Where(x => x.StripePaymentIntentId == paymentIntentId)
     .FirstOrDefaultAsync();

            if (transaction != null)
            {
                transaction.Status = status;

                if (status == PaymentStatus.Succeeded)
                {
                    transaction.PaidAt = DateTime.UtcNow;

                    var request = await _unitOfWork.Repository<Request>()
                        .GetByIdAsync(transaction.RequestId);
                    if (request != null)
                        request.Status = RequestStatus.Paid; 
                }

                await _unitOfWork.CompleteAsync();
            }
        }
        public async Task<PaymentResult> RefundPaymentAsync(string paymentIntentId)
        {
            var options = new RefundCreateOptions { PaymentIntent = paymentIntentId };
            var refundService = new RefundService();
            await refundService.CreateAsync(options);

            await UpdatePaymentStatusAsync(paymentIntentId, PaymentStatus.Refunded);

            return new PaymentResult { Success = true, Status = PaymentStatus.Refunded };
        }
    }
}