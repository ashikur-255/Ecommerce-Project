using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceAPI.Models;

public class Product
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal OriginalPrice { get; set; }

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Brand { get; set; } = string.Empty;

    // Stored as pipe-separated strings e.g. "img1.jpg|img2.jpg"
    public string Images { get; set; } = string.Empty;
    public string Sizes { get; set; } = string.Empty;   // "S|M|L|XL"
    public string Colors { get; set; } = string.Empty;   // "Red|Blue"
    public string Tags { get; set; } = string.Empty;

    public int Stock { get; set; }

    [Column(TypeName = "decimal(3,1)")]
    public decimal Rating { get; set; } = 0;

    public int ReviewCount { get; set; } = 0;

    public bool IsNew { get; set; } = false;
    public bool IsFeatured { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();

    // Helpers (not mapped to DB)
    [NotMapped] public List<string> ImageList => Images.Split('|', StringSplitOptions.RemoveEmptyEntries).ToList();
    [NotMapped] public List<string> SizeList => Sizes.Split('|', StringSplitOptions.RemoveEmptyEntries).ToList();
    [NotMapped] public List<string> ColorList => Colors.Split('|', StringSplitOptions.RemoveEmptyEntries).ToList();
    [NotMapped] public List<string> TagList => Tags.Split('|', StringSplitOptions.RemoveEmptyEntries).ToList();
}