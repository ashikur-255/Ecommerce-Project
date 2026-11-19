using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ProductsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/products
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductQueryDto query)
    {
        var q = _db.Products.AsQueryable();

        // ── Filters ───────────────────────────────────────────────────────────
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var terms = query.Search
                .ToLower()
                .Trim()
                .Split(' ', StringSplitOptions.RemoveEmptyEntries);

            foreach (var term in terms)
            {
                q = q.Where(p =>
                    (p.Name ?? "").ToLower().Contains(term) ||
                    p.Description.ToLower().Contains(term) ||
                    p.Category.ToLower().Contains(term) ||
                    p.Brand.ToLower().Contains(term) ||
                    p.Tags.ToLower().Contains(term) ||
                    p.Colors.ToLower().Contains(term) ||
                    p.Sizes.ToLower().Contains(term)
                );
            }
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
            q = q.Where(p => p.Category.ToLower() == query.Category.ToLower().Trim());

        if (!string.IsNullOrWhiteSpace(query.Brand))
            q = q.Where(p => p.Brand.ToLower() == query.Brand.ToLower().Trim());

        if (query.MinPrice.HasValue)
            q = q.Where(p => p.Price >= query.MinPrice.Value);

        if (query.MaxPrice.HasValue)
            q = q.Where(p => p.Price <= query.MaxPrice.Value);

        if (query.IsNew.HasValue)
            q = q.Where(p => p.IsNew == query.IsNew.Value);

        if (query.IsFeatured.HasValue)
            q = q.Where(p => p.IsFeatured == query.IsFeatured.Value);

        // ── Sort ──────────────────────────────────────────────────────────────
        q = (query.SortBy.ToLower(), query.SortOrder.ToLower()) switch
        {
            ("price", "asc") => q.OrderBy(p => p.Price),
            ("price", "desc") => q.OrderByDescending(p => p.Price),
            ("name", "asc") => q.OrderBy(p => p.Name),
            ("name", "desc") => q.OrderByDescending(p => p.Name),
            ("rating", _) => q.OrderByDescending(p => p.Rating),
            ("createdat", "asc") => q.OrderBy(p => p.CreatedAt),
            _ => q.OrderByDescending(p => p.CreatedAt)
        };

        // ── Pagination ────────────────────────────────────────────────────────
        var total = await q.CountAsync();
        var page = Math.Max(1, query.Page);
        var limit = Math.Clamp(query.Limit, 1, 50);
        var items = await q.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(ApiResponse<ProductListResponseDto>.Ok(new ProductListResponseDto
        {
            Products = items.Select(MapProduct).ToList(),
            Total = total,
            Page = page,
            TotalPages = (int)Math.Ceiling((double)total / limit)
        }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/products/new-arrivals
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("new-arrivals")]
    public async Task<IActionResult> GetNewArrivals()
    {
        var products = await _db.Products
            .Where(p => p.IsNew)
            .OrderByDescending(p => p.CreatedAt)
            .Take(8)
            .ToListAsync();

        return Ok(ApiResponse<List<ProductResponseDto>>.Ok(products.Select(MapProduct).ToList()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/products/featured
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured()
    {
        var products = await _db.Products
            .Where(p => p.IsFeatured)
            .OrderByDescending(p => p.Rating)
            .Take(12)
            .ToListAsync();

        return Ok(ApiResponse<List<ProductResponseDto>>.Ok(products.Select(MapProduct).ToList()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/products/categories
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _db.Products
            .Select(p => p.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(ApiResponse<List<string>>.Ok(categories));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/products/{id}
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null)
            return NotFound(ApiResponse<string>.Fail("Product not found."));

        var reviews = await _db.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == id)
            .OrderByDescending(r => r.CreatedAt)
            .Take(10)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            product = MapProduct(product),
            reviews = reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                UserId = r.UserId,
                UserName = r.User?.Name ?? string.Empty,
                UserAvatar = r.User?.Avatar,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList()
        }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/products  [Admin]
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromForm] CreateProductDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<string>.Fail(
                string.Join("; ", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage))));

        // ✅ Check ImageUrls and Images properties
        var imageUrls = new List<string>();
        if (dto.ImageUrls != null && dto.ImageUrls.Any())
        {
            imageUrls.AddRange(dto.ImageUrls.Where(u => !string.IsNullOrWhiteSpace(u)));
        }
        if (dto.Images != null && dto.Images.Any())
        {
            var saved = await SaveImages(dto.Images);
            imageUrls.AddRange(saved);
        }

        var product = new Product
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice > 0 ? dto.OriginalPrice : dto.Price,
            Category = dto.Category.Trim(),
            Brand = dto.Brand.Trim(),
            Images = JoinPipe(imageUrls),
            Sizes = JoinPipe(dto.Sizes),
            Colors = JoinPipe(dto.Colors),
            Tags = JoinPipe(dto.Tags),
            Stock = dto.Stock,
            IsNew = dto.IsNew,
            IsFeatured = dto.IsFeatured,
            CreatedAt = DateTime.UtcNow
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<ProductResponseDto>.Ok(
            MapProduct(product),
            "Product created successfully."
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/products/{id}  [Admin]
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPut("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromForm] CreateProductDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse<string>.Fail(
                string.Join("; ", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage))));

        var product = await _db.Products.FindAsync(id);
        if (product is null)
            return NotFound(ApiResponse<string>.Fail("Product not found."));

        product.Name = dto.Name.Trim();
        product.Description = dto.Description?.Trim() ?? string.Empty;
        product.Price = dto.Price;
        product.OriginalPrice = dto.OriginalPrice > 0 ? dto.OriginalPrice : dto.Price;
        product.Category = dto.Category.Trim();
        product.Brand = dto.Brand.Trim();

        // ✅ FIX: Save new images or URLs if provided
        var imageUrls = new List<string>();
        if (dto.ImageUrls != null && dto.ImageUrls.Any())
        {
            imageUrls.AddRange(dto.ImageUrls.Where(u => !string.IsNullOrWhiteSpace(u)));
        }
        if (dto.Images != null && dto.Images.Any())
        {
            var saved = await SaveImages(dto.Images);
            imageUrls.AddRange(saved);
        }
        if (imageUrls.Any())
        {
            product.Images = JoinPipe(imageUrls);
        }

        product.Sizes = JoinPipe(dto.Sizes);
        product.Colors = JoinPipe(dto.Colors);
        product.Tags = JoinPipe(dto.Tags);
        product.Stock = dto.Stock;
        product.IsNew = dto.IsNew;
        product.IsFeatured = dto.IsFeatured;

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<ProductResponseDto>.Ok(MapProduct(product), "Product updated successfully."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /api/products/{id}/stock  [Admin]
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPatch("{id:int}/stock")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateStock(int id, [FromForm] UpdateStockDto dto)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null)
            return NotFound(ApiResponse<string>.Fail("Product not found."));

        if (dto.Stock < 0)
            return BadRequest(ApiResponse<string>.Fail("Stock cannot be negative."));

        product.Stock = dto.Stock;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { product.Id, product.Stock }, "Stock updated."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/products/brands
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("brands")]
    public async Task<IActionResult> GetBrands()
    {
        var brands = await _db.Products
            .Select(p => p.Brand)
            .Distinct()
            .OrderBy(b => b)
            .ToListAsync();

        return Ok(ApiResponse<List<string>>.Ok(brands));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/products/{id}  [Admin]
    // ─────────────────────────────────────────────────────────────────────────
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null)
            return NotFound(ApiResponse<string>.Fail("Product not found."));

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Deleted", "Product deleted successfully."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>Join a list of strings into a pipe-separated value for storage.</summary>
    private static string JoinPipe(List<string>? list) =>
        list is { Count: > 0 }
            ? string.Join("|", list.Select(s => s.Trim()).Where(s => s.Length > 0))
            : string.Empty;

    private async Task<List<string>> SaveImages(IFormFileCollection? files)
    {
        var urls = new List<string>();

        if (files == null || !files.Any())
            return urls;

        var uploadPath = Path.Combine(
            _env.WebRootPath,
            "uploads",
            "products"
        );

        Directory.CreateDirectory(uploadPath);

        foreach (var file in files)
        {
            if (file.Length == 0)
                continue;

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            urls.Add($"/uploads/products/{fileName}");
        }

        return urls;
    }

    /// <summary>Split a pipe-separated DB string back to a List for the DTO.</summary>
    private static List<string> SplitPipe(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? new List<string>()
            : value.Split('|', StringSplitOptions.RemoveEmptyEntries).ToList();

    public static ProductResponseDto MapProduct(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        OriginalPrice = p.OriginalPrice,
        Category = p.Category,
        Brand = p.Brand,
        Images = SplitPipe(p.Images),
        Sizes = SplitPipe(p.Sizes),
        Colors = SplitPipe(p.Colors),
        Tags = SplitPipe(p.Tags),
        Stock = p.Stock,
        Rating = p.Rating,
        ReviewCount = p.ReviewCount,
        IsNew = p.IsNew,
        IsFeatured = p.IsFeatured,
        CreatedAt = p.CreatedAt
    };
}

// ── Extra DTO ─────────────────────────────────────────────────────────────────
public class UpdateStockDto
{
    [System.ComponentModel.DataAnnotations.Range(0, int.MaxValue)]
    public int Stock { get; set; }
}