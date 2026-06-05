using ACH.Core.Services.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using System.Security.Claims;

namespace ACH.API.Controllers
{

    public class PaymentController : BaseApiController
    {

        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _configuration;
        public PaymentController(IPaymentService paymentService,IConfiguration configuration)    
        {
            _paymentService = paymentService;
            _configuration = configuration;
        }
        [HttpPost("create-intent/{requestId}")]
        public async Task<IActionResult> CreatePaymentIntent(Guid requestId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _paymentService.CreatePaymentIntentAsync(requestId, userId);
            if (!result.Success)
                return BadRequest(result.ErrorMessage);
            return Ok(new { clientSecret = result.ClientSecret });
        }
        //[AllowAnonymous]
        //[HttpPost("webhook")]
        //public async Task<IActionResult> Webhook()
        //{
        //    var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        //    try
        //    {
        //        var stripeSignature = Request.Headers["Stripe-Signature"];
        //        var webhookSecret = _configuration["StripeSettings:WebhookSecret"];

        //        var stripeEvent = EventUtility.ConstructEvent(
        //            json,
        //            stripeSignature,
        //            webhookSecret
        //        );

        //        var success = await _paymentService.HandleWebhookAsync(json, stripeSignature);
        //        return success ? Ok() : BadRequest();
        //    }
        //    catch (StripeException e)
        //    {
        //        return BadRequest(e.Message);
        //    }
        //}
        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeSignature = Request.Headers["Stripe-Signature"];

            try
            {
                var success = await _paymentService.HandleWebhookAsync(json, stripeSignature);
                if (!success)
                    return BadRequest("Webhook processing failed");
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("refund/{paymentIntentId}")]
        public async Task<IActionResult> Refund(string paymentIntentId)
        {
            var result = await _paymentService.RefundPaymentAsync(paymentIntentId);
            return result.Success ? Ok() : BadRequest();
        }
        [Authorize(Roles ="Admin")]
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var stats = await _paymentService.GetPaymentStatisticsAsync();
            return Ok(stats);
        }
    }
}