using EcommerceAPI.Data;
using EcommerceAPI.DTOs.Wishlist;
using EcommerceAPI.Models;
using EcommerceAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace EcommerceAPI.Services
{
    public class WishlistService : IWishlistService
    {
        private readonly AppDbContext _context;

        public WishlistService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<WishlistItemDto>> GetWishlistAsync(int userId)
        {
            return await _context.Wishlists
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .Include(x => x.Product)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new WishlistItemDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product.Name,
                    Price = x.Product.Price,
                    OriginalPrice = x.Product.OriginalPrice,
                    Image = x.Product.Images
                        .Split('|', StringSplitOptions.RemoveEmptyEntries) // ⬅️ ঠিক করা হলো
                        .FirstOrDefault() ?? "",
                    Category = x.Product.Category,
                    Brand = x.Product.Brand,
                    IsNew = x.Product.IsNew,
                    IsFeatured = x.Product.IsFeatured,
                    AddedAt = x.CreatedAt
                })
                .ToListAsync();
        }
        public async Task<int> GetWishlistCountAsync(int userId)
        {
            return await _context.Wishlists
                .CountAsync(x => x.UserId == userId);
        }

        public async Task<bool> IsInWishlistAsync(int userId, int productId)
        {
            return await _context.Wishlists
                .AnyAsync(x =>
                    x.UserId == userId &&
                    x.ProductId == productId);
        }

        public async Task<bool> AddToWishlistAsync(int userId, int productId)
        {
            var productExists = await _context.Products
                .AnyAsync(x => x.Id == productId);

            if (!productExists)
                return false;

            if (await IsInWishlistAsync(userId, productId))
                return false;

            var wishlist = new Wishlist
            {
                UserId = userId,
                ProductId = productId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Wishlists.Add(wishlist);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemoveFromWishlistAsync(int userId, int productId)
        {
            var item = await _context.Wishlists
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.ProductId == productId);

            if (item == null)
                return false;

            _context.Wishlists.Remove(item);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task ClearWishlistAsync(int userId)
        {
            var items = await _context.Wishlists
                .Where(x => x.UserId == userId)
                .ToListAsync();

            if (items.Count == 0)
                return;

            _context.Wishlists.RemoveRange(items);

            await _context.SaveChangesAsync();
        }
        
    }
}