using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceAPI.Models;

public class Order
{
    [Key]
    public int Id { get; set; }

    [ForeignKey(nameof(User))]
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Shipping address (owned type / flattened columns)
    [Required, MaxLength(200)] public string ShipFullName { get; set; } = string.Empty;
    [Required, MaxLength(300)] public string ShipAddress { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string ShipCity { get; set; } = string.Empty;
    [MaxLength(20)] public string ShipPostalCode { get; set; } = string.Empty;
    [MaxLength(100)] public string ShipCountry { get; set; } = string.Empty;
    [MaxLength(30)] public string ShipPhone { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")] public decimal SubTotal { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal ShippingCost { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal Tax { get; set; }
    [Column(TypeName = "decimal(18,2)")] public decimal TotalAmount { get; set; }

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "stripe";
    // stripe | cash_on_delivery

    [MaxLength(20)]
    public string PaymentStatus { get; set; } = "pending";
    // pending | paid | failed | refunded

    [MaxLength(200)]
    public string? PaymentIntentId { get; set; }

    [MaxLength(20)] public string OrderStatus { get; set; } = "processing"; // processing | shipped | delivered | cancelled

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ── Delivery (Steadfast) ─────────────────────────────────────────────────
    public string? ConsignmentId { get; set; }      // Steadfast's internal ID
    public string? TrackingCode { get; set; }        // public tracking code, e.g. "SF123456789"
    public string? DeliveryStatus { get; set; }       // pending, delivered, cancelled, etc. (from Steadfast)

    // Navigation
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    [Key]
    public int Id { get; set; }

    [ForeignKey(nameof(Order))]
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    [ForeignKey(nameof(Product))]
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    // Snapshot at time of purchase
    [Required, MaxLength(200)] public string ProductName { get; set; } = string.Empty;
    [MaxLength(500)] public string ProductImage { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")] public decimal Price { get; set; }

    public int Quantity { get; set; }
    [MaxLength(20)] public string Size { get; set; } = string.Empty;
    [MaxLength(50)] public string Color { get; set; } = string.Empty;
}