using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceAPI.Models;

public class Review
{
    [Key]
    public int Id { get; set; }

    [ForeignKey(nameof(Product))]
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [ForeignKey(nameof(User))]
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Range(1, 5)]
    public int Rating { get; set; }

    [Required, MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}