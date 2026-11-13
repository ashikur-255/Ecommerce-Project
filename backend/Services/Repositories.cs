using EcommerceAPI.Data;
using EcommerceAPI.Models;
using EcommerceAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Repositories;

public class WishlistRepository : IWishlistRepository
{
    private readonly AppDbContext _context;

    public WishlistRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsAsync(int userId, int productId)
    {
        return await _context.Wishlists
            .AsNoTracking()
            .AnyAsync(x =>
                x.UserId == userId &&
                x.ProductId == productId);
    }

    public async Task<Wishlist?> GetAsync(int userId, int productId)
    {
        return await _context.Wishlists
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.ProductId == productId);
    }

    public async Task<List<Wishlist>> GetPagedAsync(
        int userId,
        int page,
        int pageSize)
    {
        return await _context.Wishlists
            .AsNoTracking()
            .Include(x => x.Product)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> CountAsync(int userId)
    {
        return await _context.Wishlists
            .CountAsync(x => x.UserId == userId);
    }

    public async Task AddAsync(Wishlist wishlist)
    {
        await _context.Wishlists.AddAsync(wishlist);
    }

    public Task RemoveAsync(Wishlist wishlist)
    {
        _context.Wishlists.Remove(wishlist);
        return Task.CompletedTask;
    }

    public Task RemoveRangeAsync(IEnumerable<Wishlist> wishlists)
    {
        _context.Wishlists.RemoveRange(wishlists);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public Task<List<Wishlist>> GetWishlistAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetWishlistCountAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public Task ClearAsync(int userId)
    {
        throw new NotImplementedException();
    }
}