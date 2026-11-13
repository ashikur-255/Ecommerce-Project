namespace EcommerceAPI.DTOs.Wishlist;

public class MoveWishlistToCartDto
{
    public int ProductId { get; set; }

    public int Quantity { get; set; } = 1;

    public string Size { get; set; } = "";

    public string Color { get; set; } = "";
}