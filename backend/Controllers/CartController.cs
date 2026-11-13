using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _db;

    public CartController(AppDbContext db)
    {
        _db = db;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/cart
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await BuildCartResponseAsync(CurrentUserId);
        return Ok(ApiResponse<CartResponseDto>.Ok(cart));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/cart/count
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("count")]
    public async Task<IActionResult> GetCartCount()
    {
        var count = await _db.CartItems
            .Where(c => c.UserId == CurrentUserId)
            .SumAsync(c => (int?)c.Quantity) ?? 0;

        return Ok(ApiResponse<object>.Ok(new { count }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/cart/add
    // Adds item; increments quantity if same product+size+color exists.
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<string>.Fail("Invalid input."));

        var product = await _db.Products.FindAsync(dto.ProductId);
        if (product is null)
            return NotFound(ApiResponse<string>.Fail("Product not found."));

        if (product.Stock < 1)
            return BadRequest(ApiResponse<string>.Fail("Product is out of stock."));

        var userId = CurrentUserId;
        var sizeTrim = (dto.Size ?? string.Empty).Trim();
        var colorTrim = (dto.Color ?? string.Empty).Trim();

        var existing = await _db.CartItems.FirstOrDefaultAsync(c =>
            c.UserId == userId &&
            c.ProductId == dto.ProductId &&
            c.Size == sizeTrim &&
            c.Color == colorTrim);

        if (existing is not null)
        {
            var newQty = existing.Quantity + dto.Quantity;
            if (newQty > product.Stock)
                return BadRequest(ApiResponse<string>.Fail(
                    $"Cannot add more. Only {product.Stock} in stock."));

            existing.Quantity = newQty;
        }
        else
        {
            if (dto.Quantity > product.Stock)
                return BadRequest(ApiResponse<string>.Fail(
                    $"Only {product.Stock} item(s) in stock."));

            _db.CartItems.Add(new CartItem
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                Size = sizeTrim,
                Color = colorTrim,
                AddedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();

        var cart = await BuildCartResponseAsync(userId);
        return Ok(ApiResponse<CartResponseDto>.Ok(cart, "Item added to cart."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/cart/update
    // Sets quantity. Pass quantity = 0 to remove the item.
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPut("update")]
    public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<string>.Fail("Invalid input."));

        var userId = CurrentUserId;
        var sizeTrim = (dto.Size ?? string.Empty).Trim();
        var colorTrim = (dto.Color ?? string.Empty).Trim();

        var item = await _db.CartItems.FirstOrDefaultAsync(c =>
            c.UserId == userId &&
            c.ProductId == dto.ProductId &&
            c.Size == sizeTrim &&
            c.Color == colorTrim);

        if (item is null)
            return NotFound(ApiResponse<string>.Fail("Cart item not found."));

        if (dto.Quantity <= 0)
        {
            _db.CartItems.Remove(item);
        }
        else
        {
            var product = await _db.Products.FindAsync(dto.ProductId);
            if (product is not null && dto.Quantity > product.Stock)
                return BadRequest(ApiResponse<string>.Fail(
                    $"Only {product.Stock} item(s) in stock."));

            item.Quantity = dto.Quantity;
        }

        await _db.SaveChangesAsync();

        var cart = await BuildCartResponseAsync(userId);
        return Ok(ApiResponse<CartResponseDto>.Ok(cart, "Cart updated."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/cart/remove/{productId}?size=M&color=Black
    // ─────────────────────────────────────────────────────────────────────────
    [HttpDelete("remove/{productId:int}")]
    public async Task<IActionResult> RemoveFromCart(
        int productId,
        [FromQuery] string size = "",
        [FromQuery] string color = "")
    {
        var userId = CurrentUserId;
        var sizeTrim = size.Trim();
        var colorTrim = color.Trim();

        var item = await _db.CartItems.FirstOrDefaultAsync(c =>
            c.UserId == userId &&
            c.ProductId == productId &&
            c.Size == sizeTrim &&
            c.Color == colorTrim);

        if (item is null)
            return NotFound(ApiResponse<string>.Fail("Cart item not found."));

        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync();

        var cart = await BuildCartResponseAsync(userId);
        return Ok(ApiResponse<CartResponseDto>.Ok(cart, "Item removed from cart."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/cart/clear
    // ─────────────────────────────────────────────────────────────────────────
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = CurrentUserId;
        var items = await _db.CartItems.Where(c => c.UserId == userId).ToListAsync();

        if (!items.Any())
            return Ok(ApiResponse<CartResponseDto>.Ok(new CartResponseDto(), "Cart is already empty."));

        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<CartResponseDto>.Ok(new CartResponseDto(), "Cart cleared."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helper
    // ─────────────────────────────────────────────────────────────────────────
    private async Task<CartResponseDto> BuildCartResponseAsync(int userId)
    {
        var items = await _db.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.AddedAt)
            .ToListAsync();

        var itemDtos = items.Select(c => new CartItemResponseDto
        {
            ProductId = c.ProductId,
            Quantity = c.Quantity,
            Size = c.Size,
            Color = c.Color,
            Product = ProductsController.MapProduct(c.Product)
        }).ToList();

        return new CartResponseDto
        {
            Items = itemDtos,
            ItemCount = items.Sum(i => i.Quantity),
            Total = items.Sum(i => i.Product.Price * i.Quantity)
        };
    }
}