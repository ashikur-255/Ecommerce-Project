using System.ComponentModel.DataAnnotations;

namespace EcommerceAPI.DTOs.Wishlist;

public class BatchWishlistDto
{
    [Required]
    public List<int> ProductIds { get; set; } = new();
}