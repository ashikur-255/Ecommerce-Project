using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db)
    {
        _db = db;
    }

    private int UserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/reviews/{productId}
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("{productId:int}")]
    public async Task<IActionResult> GetProductReviews(
        int productId,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        var productExists = await _db.Products.AnyAsync(p => p.Id == productId);
        if (!productExists)
            return NotFound(ApiResponse<string>.Fail("Product not found."));

        var query = _db.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync();
        var reviews = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            reviews = reviews.Select(MapReview),
            total,
            page,
            totalPages = (int)Math.Ceiling((double)total / limit)
        }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/reviews
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
    {
        var product = await _db.Products.FindAsync(dto.ProductId);
        if (product is null)
            return NotFound(ApiResponse<string>.Fail("Product not found."));

        // One review per user per product (enforced at DB level too via unique index)
        var alreadyReviewed = await _db.Reviews
            .AnyAsync(r => r.ProductId == dto.ProductId && r.UserId == UserId);

        if (alreadyReviewed)
            return Conflict(ApiResponse<string>.Fail("You have already reviewed this product."));

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = UserId,
            Rating = Math.Clamp(dto.Rating, 1, 5),
            Comment = dto.Comment
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        // Recalculate product average rating
        await RecalculateProductRatingAsync(dto.ProductId);

        // Load the user navigation for the response
        await _db.Entry(review).Reference(r => r.User).LoadAsync();

        return Ok(ApiResponse<ReviewResponseDto>.Ok(MapReview(review), "Review submitted."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/reviews/{id}
    // ─────────────────────────────────────────────────────────────────────────
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _db.Reviews.FindAsync(id);
        if (review is null)
            return NotFound(ApiResponse<string>.Fail("Review not found."));

        if (review.UserId != UserId && !User.IsInRole("admin"))
            return Forbid();

        int productId = review.ProductId;

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();

        await RecalculateProductRatingAsync(productId);

        return Ok(ApiResponse<string>.Ok("Deleted", "Review deleted."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────
    private async Task RecalculateProductRatingAsync(int productId)
    {
        var product = await _db.Products.FindAsync(productId);
        if (product is null) return;

        var ratings = await _db.Reviews
            .Where(r => r.ProductId == productId)
            .Select(r => r.Rating)
            .ToListAsync();

        product.Rating = ratings.Any() ? Math.Round((decimal)ratings.Average(), 1) : 0m;
        product.ReviewCount = ratings.Count;

        await _db.SaveChangesAsync();
    }

    private static ReviewResponseDto MapReview(Review r) => new()
    {
        Id = r.Id,
        ProductId = r.ProductId,
        UserId = r.UserId,
        UserName = r.User?.Name ?? string.Empty,
        Rating = r.Rating,
        Comment = r.Comment,
        CreatedAt = r.CreatedAt
    };
}