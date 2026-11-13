namespace EcommerceAPI.DTOs.Wishlist;

public class WishlistDto
{
    public List<WishlistItemDto> Items { get; set; } = new();

    public int TotalItems { get; set; }

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalPages { get; set; }
}