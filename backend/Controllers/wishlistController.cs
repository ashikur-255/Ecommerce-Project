using EcommerceAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EcommerceAPI.DTOs.Wishlist;

namespace EcommerceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        private int GetUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Invalid token.");

            return int.Parse(userId);
        }

        // GET: api/wishlist
        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = GetUserId();

            var wishlist = await _wishlistService.GetWishlistAsync(userId);

            return Ok(wishlist);
        }

        // GET: api/wishlist/count
        [HttpGet("count")]
        public async Task<IActionResult> GetWishlistCount()
        {
            var userId = GetUserId();

            var count = await _wishlistService.GetWishlistCountAsync(userId);

            return Ok(new
            {
                count
            });
        }

        // POST: api/wishlist/{productId}
        [HttpPost("{productId:int}")]
        public async Task<IActionResult> AddToWishlist(int productId)
        {
            var userId = GetUserId();

            var result = await _wishlistService.AddToWishlistAsync(userId, productId);

            if (!result)
                return BadRequest(new
                {
                    success = false,
                    message = "Product already exists in wishlist."
                });

            return Ok(new
            {
                success = true,
                message = "Added to wishlist."
            });
        }

        // DELETE: api/wishlist/{productId}
        [HttpDelete("{productId:int}")]
        public async Task<IActionResult> RemoveFromWishlist(int productId)
        {
            var userId = GetUserId();

            var result = await _wishlistService.RemoveFromWishlistAsync(userId, productId);

            if (!result)
                return NotFound(new
                {
                    success = false,
                    message = "Wishlist item not found."
                });

            return Ok(new
            {
                success = true,
                message = "Removed from wishlist."
            });
        }

        // GET: api/wishlist/check/5
        [HttpGet("check/{productId:int}")]
        public async Task<IActionResult> IsInWishlist(int productId)
        {
            var userId = GetUserId();

            var exists = await _wishlistService.IsInWishlistAsync(userId, productId);

            return Ok(new
            {
                isInWishlist = exists
            });
        }

        // DELETE: api/wishlist/clear
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearWishlist()
        {
            var userId = GetUserId();

            await _wishlistService.ClearWishlistAsync(userId);

            return Ok(new
            {
                success = true,
                message = "Wishlist cleared successfully."
            });
        }
    }
}