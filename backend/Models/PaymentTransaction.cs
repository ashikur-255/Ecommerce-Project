using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Models;

// Add more providers here as you integrate them (Nagad, Rocket, ...)
public enum MfsProvider
{
    Bkash,
    Nagad,
    Rocket
}

public enum MfsTransactionStatus
{
    Initiated,
    Completed,
    Failed,
    Cancelled
}

[Index(nameof(Provider), nameof(ProviderPaymentId))]
public class PaymentTransaction
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public MfsProvider Provider { get; set; }

    // The provider's payment session id (bKash calls this "paymentID")
    [MaxLength(100)]
    public string ProviderPaymentId { get; set; } = string.Empty;

    // The provider's final transaction id once completed (bKash calls this "trxID")
    [MaxLength(100)]
    public string? ProviderTrxId { get; set; }

    [MaxLength(100)]
    public string MerchantInvoiceNumber { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "BDT";

    public MfsTransactionStatus Status { get; set; } = MfsTransactionStatus.Initiated;

    // Linked once your order is actually created — payment can happen before the
    // order row exists, same as your Stripe PaymentIntentId flow.
    public int? OrderId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}