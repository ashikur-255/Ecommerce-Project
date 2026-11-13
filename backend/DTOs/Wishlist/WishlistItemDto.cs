namespace EcommerceAPI.DTOs.Wishlist;

public class WishlistItemDto
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public decimal OriginalPrice { get; set; }

    public string Image { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Brand { get; set; } = string.Empty;

    public bool IsNew { get; set; }

    public bool IsFeatured { get; set; }

    public int Stock { get; set; }

    public bool InStock { get; set; }

    public DateTime AddedAt { get; set; }
}