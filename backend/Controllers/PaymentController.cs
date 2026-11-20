using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
using EcommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly PaymentRecordService _paymentRecordService;
    private readonly AppDbContext _db;

    public PaymentController(
        IConfiguration config,
        PaymentRecordService paymentRecordService,
        AppDbContext db)
    {
        _config = config;
        _paymentRecordService = paymentRecordService;
        _db = db;

        var stripeKey = _config["Stripe:SecretKey"] ?? Environment.GetEnvironmentVariable("Stripe__SecretKey");
        if (!string.IsNullOrEmpty(stripeKey) && !stripeKey.Contains("sk_test_xxx"))
        {
            StripeConfiguration.ApiKey = stripeKey;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // GET: /api/payments (Admin)
    // ─────────────────────────────────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetPayments(
    [FromQuery] string? status = null,
    [FromQuery] int page = 1,
    [FromQuery] int limit = 20)
    {
        var query = _db.Payments.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (Enum.TryParse<PaymentState>(status, true, out var paymentStatus))
            {
                query = query.Where(x => x.Status == paymentStatus);
            }
        }

        var total = await query.CountAsync();

        var payments = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            payments,
            total,
            page,
            totalPages = (int)Math.Ceiling((double)total / limit)
        }));
    }

    // ─────────────────────────────────────────────────────────────
    // GET: /api/payments/{id} (Admin)
    // ─────────────────────────────────────────────────────────────
    [HttpGet("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetPaymentById(int id)
    {
        var payment = await _db.Payments
            .Include(x => x.User)
            .Include(x => x.Order)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (payment == null)
            return NotFound(ApiResponse<string>.Fail("Payment not found."));

        return Ok(ApiResponse<Payment>.Ok(payment));
    }

    // ─────────────────────────────────────────────────────────────
    // POST: /api/payments/create-intent
    // ─────────────────────────────────────────────────────────────
    [HttpPost("create-intent")]
    public async Task<IActionResult> CreatePaymentIntent(
        [FromBody] CreatePaymentIntentDto dto)
    {
        if (dto.Amount <= 0)
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "Amount must be greater than zero."));
        }

        var stripeKey = _config["Stripe:SecretKey"] ?? Environment.GetEnvironmentVariable("Stripe__SecretKey");
        if (string.IsNullOrWhiteSpace(stripeKey) || stripeKey.Contains("sk_test_xxx"))
        {
            return BadRequest(
                ApiResponse<string>.Fail(
                    "Stripe payment gateway is not configured yet on this server. Please choose Cash on Delivery or another available payment method."));
        }

        StripeConfiguration.ApiKey = stripeKey;

        var userIdClaim =
            User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? "unknown";

        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(dto.Amount * 100),
            Currency = dto.Currency.ToLower(),

            AutomaticPaymentMethods =
                new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true
                },

            Metadata = new Dictionary<string, string>
            {
                { "userId", userIdClaim }
            }
        };

        try
        {
            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);

            if (int.TryParse(userIdClaim, out var userId))
            {
                await _paymentRecordService.RecordAsync(
                    userId,
                    PaymentProvider.Stripe,
                    dto.Amount,
                    dto.Currency.ToUpper(),
                    providerReference: intent.Id,
                    status: PaymentState.Pending);
            }

            return Ok(
                ApiResponse<PaymentIntentResponseDto>.Ok(
                    new PaymentIntentResponseDto
                    {
                        ClientSecret = intent.ClientSecret,
                        PublishableKey =
                            _config["Stripe:PublishableKey"]
                            ?? string.Empty
                    }));
        }
        catch (StripeException ex)
        {
            return BadRequest(
                ApiResponse<string>.Fail(ex.Message));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // POST: /api/payments/webhook
    // ─────────────────────────────────────────────────────────────
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        var json =
            await new StreamReader(
                HttpContext.Request.Body)
                .ReadToEndAsync();

        var webhookSecret =
            _config["Stripe:WebhookSecret"]
            ?? string.Empty;

        var stripeSignature =
            Request.Headers["Stripe-Signature"]
                .ToString();

        try
        {
            var stripeEvent =
                EventUtility.ConstructEvent(
                    json,
                    stripeSignature,
                    webhookSecret);

            switch (stripeEvent.Type)
            {
                case Events.PaymentIntentSucceeded:

                    var succeeded =
                        stripeEvent.Data.Object as PaymentIntent;

                    if (succeeded != null)
                    {
                        await _paymentRecordService
                            .UpdateStatusByReferenceAsync(
                                PaymentProvider.Stripe,
                                succeeded.Id,
                                PaymentState.Completed,
                                providerTransactionId:
                                    succeeded.LatestChargeId);
                    }

                    Console.WriteLine(
                        $"[Stripe] Success: {succeeded?.Id}");

                    break;

                case Events.PaymentIntentPaymentFailed:

                    var failed =
                        stripeEvent.Data.Object as PaymentIntent;

                    if (failed != null)
                    {
                        await _paymentRecordService
                            .UpdateStatusByReferenceAsync(
                                PaymentProvider.Stripe,
                                failed.Id,
                                PaymentState.Failed,
                                failureReason:
                                    failed.LastPaymentError?.Message);
                    }

                    Console.WriteLine(
                        $"[Stripe] Failed: {failed?.Id}");

                    break;

                default:

                    Console.WriteLine(
                        $"[Stripe] Unhandled event: {stripeEvent.Type}");

                    break;
            }

            return Ok();
        }
        catch (StripeException ex)
        {
            return BadRequest(new
            {
                error = ex.Message
            });
        }
    }
}