using System.Security.Claims;
using EcommerceAPI.Config;
using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
using EcommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/bkash")]
public class BkashController : ControllerBase
{
    private readonly BkashPaymentGateway _gateway;
    private readonly AppDbContext _db;
    private readonly BkashSettings _settings;
    private readonly PaymentRecordService _paymentRecordService;

    public BkashController(
        BkashPaymentGateway gateway,
        AppDbContext db,
        IOptions<BkashSettings> settings,
        PaymentRecordService paymentRecordService)
    {
        _gateway = gateway;
        _db = db;
        _settings = settings.Value;
        _paymentRecordService = paymentRecordService;
    }

    // POST /api/bkash/create-payment  (auth required — same spot in the flow as Stripe's create-intent)
    [HttpPost("create-payment")]
    [Authorize]
    public async Task<IActionResult> CreatePayment([FromBody] CreateMfsPaymentDto dto)
    {
        if (dto.Amount <= 0)
            return BadRequest(ApiResponse<string>.Fail("Amount must be greater than zero."));

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}-{userId}";

        try
        {
            var (paymentId, redirectUrl) = await _gateway.CreatePaymentAsync(dto.Amount, dto.Currency, invoiceNumber);

            // bKash-specific bookkeeping (grant/execute state, invoice number, etc.)
            _db.PaymentTransactions.Add(new PaymentTransaction
            {
                UserId = userId,
                Provider = MfsProvider.Bkash,
                ProviderPaymentId = paymentId,
                MerchantInvoiceNumber = invoiceNumber,
                Amount = dto.Amount,
                Currency = dto.Currency,
                Status = MfsTransactionStatus.Initiated
            });
            await _db.SaveChangesAsync();

            // Cross-provider reporting row — shows up in GET /api/payments
            // alongside Stripe and COD payments.
            await _paymentRecordService.RecordAsync(
                userId, PaymentProvider.Bkash, dto.Amount, dto.Currency,
                providerReference: paymentId, status: PaymentState.Pending);

            return Ok(ApiResponse<MfsPaymentCreateResponseDto>.Ok(new MfsPaymentCreateResponseDto
            {
                Provider = "bkash",
                PaymentId = paymentId,
                RedirectUrl = redirectUrl
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail($"Failed to initiate bKash payment: {ex.Message}"));
        }
    }

    // GET /api/bkash/callback?paymentID=...&status=success|failure|cancel
    // bKash redirects the customer's browser here after they finish on their app.
    [HttpGet("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> Callback([FromQuery] string paymentID, [FromQuery] string status)
    {
        var transaction = await _db.PaymentTransactions
            .FirstOrDefaultAsync(t => t.ProviderPaymentId == paymentID && t.Provider == MfsProvider.Bkash);

        if (transaction == null)
            return Redirect($"{_settings.FrontendBaseUrl}/checkout/payment-result?provider=bkash&status=failed&reason=not_found");

        if (!status.Equals("success", StringComparison.OrdinalIgnoreCase))
        {
            transaction.Status = status.Equals("cancel", StringComparison.OrdinalIgnoreCase)
                ? MfsTransactionStatus.Cancelled
                : MfsTransactionStatus.Failed;
            transaction.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await _paymentRecordService.UpdateStatusByReferenceAsync(
                PaymentProvider.Bkash, paymentID,
                transaction.Status == MfsTransactionStatus.Cancelled ? PaymentState.Cancelled : PaymentState.Failed);

            return Redirect(
                $"{_settings.FrontendBaseUrl}/checkout/payment-result?provider=bkash&status={transaction.Status.ToString().ToLower()}&paymentId={paymentID}");
        }

        try
        {
            var (success, trxId, _) = await _gateway.ExecutePaymentAsync(paymentID);

            transaction.Status = success ? MfsTransactionStatus.Completed : MfsTransactionStatus.Failed;
            transaction.ProviderTrxId = trxId;
            transaction.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await _paymentRecordService.UpdateStatusByReferenceAsync(
                PaymentProvider.Bkash, paymentID,
                success ? PaymentState.Completed : PaymentState.Failed,
                providerTransactionId: trxId);

            var resultStatus = success ? "success" : "failed";
            return Redirect(
                $"{_settings.FrontendBaseUrl}/checkout/payment-result?provider=bkash&status={resultStatus}&paymentId={paymentID}&trxId={trxId}");
        }
        catch
        {
            transaction.Status = MfsTransactionStatus.Failed;
            transaction.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await _paymentRecordService.UpdateStatusByReferenceAsync(
                PaymentProvider.Bkash, paymentID, PaymentState.Failed,
                failureReason: "Execute call threw an exception.");

            return Redirect($"{_settings.FrontendBaseUrl}/checkout/payment-result?provider=bkash&status=failed&paymentId={paymentID}");
        }
    }

    // GET /api/bkash/status/{paymentId}  (auth — frontend calls this to verify before creating the order)
    [HttpGet("status/{paymentId}")]
    [Authorize]
    public async Task<IActionResult> GetStatus(string paymentId)
    {
        var transaction = await _db.PaymentTransactions
            .FirstOrDefaultAsync(t => t.ProviderPaymentId == paymentId && t.Provider == MfsProvider.Bkash);

        if (transaction == null)
            return NotFound(ApiResponse<string>.Fail("Transaction not found."));

        return Ok(ApiResponse<MfsTransactionResponseDto>.Ok(new MfsTransactionResponseDto
        {
            Id = transaction.Id,
            Provider = "bkash",
            ProviderPaymentId = transaction.ProviderPaymentId,
            ProviderTrxId = transaction.ProviderTrxId,
            Amount = transaction.Amount,
            Currency = transaction.Currency,
            Status = transaction.Status.ToString(),
            CreatedAt = transaction.CreatedAt
        }));
    }
}