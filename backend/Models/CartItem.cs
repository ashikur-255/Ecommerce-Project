using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceAPI.Models;

public class CartItem
{
    [Key]
    public int Id { get; set; }

    [ForeignKey(nameof(User))]
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [ForeignKey(nameof(Product))]
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; } = 1;

    [MaxLength(20)]
    public string Size { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Color { get; set; } = string.Empty;

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}