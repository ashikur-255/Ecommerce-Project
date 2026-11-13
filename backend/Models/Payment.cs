using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceAPI.Models;

public enum PaymentProvider
{
    Stripe,
    Bkash,
    Nagad,
    Rocket,
    CashOnDelivery,
    SslCommerz // ✅ added
}

public enum PaymentState
{
    Pending,
    Completed,
    Failed,
    Cancelled,
    Refunded
}

[Index(nameof(Provider), nameof(ProviderReference))]
[Index(nameof(OrderId))]
[Index(nameof(UserId))]
[Index(nameof(Status))]
public class Payment
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    // Nullable: a payment intent is created before the Order row exists
    public int? OrderId { get; set; }
    public Order? Order { get; set; }

    public PaymentProvider Provider { get; set; } = PaymentProvider.Stripe;

    // Stripe: PaymentIntent id. bKash/Nagad/Rocket: their paymentID. null for COD.
    [MaxLength(150)]
    public string? ProviderReference { get; set; }

    // Stripe: charge id. bKash/Nagad/Rocket: their trxID once completed.
    [MaxLength(150)]
    public string? ProviderTransactionId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "BDT";

    public PaymentState Status { get; set; } = PaymentState.Pending;

    [MaxLength(2000)]
    public string? FailureReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}