using EcommerceAPI.Data;
using EcommerceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Services;

/// <summary>
/// Cross-provider payment recording service.
/// Every payment method (Stripe, bKash, COD, etc.) calls this to write/update
/// a row in the Payments table — giving the admin a single unified view.
/// </summary>
public class PaymentRecordService
{
    private readonly AppDbContext _db;

    public PaymentRecordService(AppDbContext db) => _db = db;

    // ── Create a new payment record (Pending by default) ──────────────────
    public async Task<Payment> RecordAsync(
        int userId,
        PaymentProvider provider,
        decimal amount,
        string currency = "BDT",
        string? providerReference = null,
        PaymentState status = PaymentState.Pending,
        int? orderId = null)
    {
        var payment = new Payment
        {
            UserId = userId,
            Provider = provider,
            Amount = amount,
            Currency = currency.ToUpper(),
            ProviderReference = providerReference,
            Status = status,
            OrderId = orderId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();
        return payment;
    }

    // ── Update an existing row by provider + providerReference ─────────────
    public async Task UpdateStatusByReferenceAsync(
        PaymentProvider provider,
        string providerReference,
        PaymentState newStatus,
        string? providerTransactionId = null,
        string? failureReason = null,
        int? orderId = null)
    {
        var payment = await _db.Payments
            .FirstOrDefaultAsync(p =>
                p.Provider == provider &&
                p.ProviderReference == providerReference);

        if (payment is null) return;

        payment.Status = newStatus;
        payment.UpdatedAt = DateTime.UtcNow;

        if (providerTransactionId is not null)
            payment.ProviderTransactionId = providerTransactionId;

        if (failureReason is not null)
            payment.FailureReason = failureReason;

        if (orderId.HasValue)
            payment.OrderId = orderId;

        await _db.SaveChangesAsync();
    }

    // ── Mark an existing payment Completed and link it to an Order ─────────
    public async Task CompletePaymentAsync(int paymentId, int orderId)
    {
        var payment = await _db.Payments.FindAsync(paymentId);
        if (payment is null) return;

        payment.Status = PaymentState.Completed;
        payment.OrderId = orderId;
        payment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    // ── Create a COD payment record (already "Completed" conceptually) ─────
    public async Task<Payment> RecordCodAsync(int userId, decimal amount, int orderId)
    {
        var payment = new Payment
        {
            UserId = userId,
            Provider = PaymentProvider.CashOnDelivery,
            Amount = amount,
            Currency = "BDT",
            Status = PaymentState.Pending,  // becomes Completed on delivery
            OrderId = orderId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();
        return payment;
    }

    // ── Link an existing payment to an order ─────────────────────
    public async Task LinkOrderAsync(
        PaymentProvider provider,
        string reference,
        int orderId)
    {
        var payment = await _db.Payments
            .FirstOrDefaultAsync(p =>
                p.Provider == provider &&
                (
                    p.ProviderReference == reference ||
                    p.ProviderTransactionId == reference
                ));

        if (payment == null)
            return;

        payment.OrderId = orderId;
        payment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }
}
