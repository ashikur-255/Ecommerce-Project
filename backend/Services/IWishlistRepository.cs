using EcommerceAPI.Models;

namespace EcommerceAPI.Repositories.Interfaces;

public interface IWishlistRepository
{
    Task<List<Wishlist>> GetWishlistAsync(int userId);

    Task<int> GetWishlistCountAsync(int userId);

    Task<bool> ExistsAsync(int userId, int productId);

    Task AddAsync(Wishlist wishlist);

    Task RemoveAsync(Wishlist wishlist);

    Task<Wishlist?> GetAsync(int userId, int productId);

    Task ClearAsync(int userId);

    Task SaveChangesAsync();
}