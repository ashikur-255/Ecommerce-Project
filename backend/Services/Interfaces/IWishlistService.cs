using EcommerceAPI.DTOs.Wishlist;

namespace EcommerceAPI.Services.Interfaces
{
    public interface IWishlistService
    {
        Task<List<WishlistItemDto>> GetWishlistAsync(int userId); // ⬅️ WishlistDto থেকে WishlistItemDto তে ঠিক করা
        Task<int> GetWishlistCountAsync(int userId);
        Task<bool> AddToWishlistAsync(int userId, int productId);
        Task<bool> RemoveFromWishlistAsync(int userId, int productId);
        Task<bool> IsInWishlistAsync(int userId, int productId);
        Task ClearWishlistAsync(int userId);
    }
}