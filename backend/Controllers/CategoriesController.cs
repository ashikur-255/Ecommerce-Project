using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public CategoriesController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    // GET: api/categories?includeInactive=false
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<List<CategoryResponseDto>>>> GetAll([FromQuery] bool includeInactive = false)
    {
        var query = _db.Categories.AsQueryable();
        if (!includeInactive) query = query.Where(c => c.IsActive);

        var categories = await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();

        var productCounts = await _db.Products
            .GroupBy(p => p.Category)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Category, x => x.Count);

        var result = categories
            .Select(c => MapToDto(c, productCounts.TryGetValue(c.Name, out var n) ? n : 0))
            .ToList();

        return Ok(ApiResponse<List<CategoryResponseDto>>.Ok(result));
    }

    // GET: api/categories/5
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<CategoryResponseDto>>> GetById(int id)
    {
        var category = await _db.Categories.FindAsync(id);
        if (category == null)
            return NotFound(ApiResponse<CategoryResponseDto>.Fail("Category not found."));

        var count = await _db.Products.CountAsync(p => p.Category == category.Name);
        return Ok(ApiResponse<CategoryResponseDto>.Ok(MapToDto(category, count)));
    }

    // POST: api/categories  (multipart/form-data — admin only)
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ApiResponse<CategoryResponseDto>>> Create([FromForm] CreateCategoryDto dto)
    {
        var name = dto.Name.Trim();
        var slug = Slugify(name);

        if (await _db.Categories.AnyAsync(c => c.Slug == slug))
            return BadRequest(ApiResponse<CategoryResponseDto>.Fail("A category with this name already exists."));

        var category = new Category
        {
            Name = name,
            Slug = slug,
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            IsActive = dto.IsActive,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (dto.Image != null)
            category.Image = await SaveImageAsync(dto.Image);

        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<CategoryResponseDto>.Ok(MapToDto(category, 0), "Category created."));
    }

    // PUT: api/categories/5  (multipart/form-data — admin only)
    [HttpPut("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ApiResponse<CategoryResponseDto>>> Update(int id, [FromForm] UpdateCategoryDto dto)
    {
        var category = await _db.Categories.FindAsync(id);
        if (category == null)
            return NotFound(ApiResponse<CategoryResponseDto>.Fail("Category not found."));

        var name = dto.Name.Trim();
        var slug = Slugify(name);

        if (await _db.Categories.AnyAsync(c => c.Slug == slug && c.Id != id))
            return BadRequest(ApiResponse<CategoryResponseDto>.Fail("A category with this name already exists."));

        // Keep Product.Category strings in sync if the category is renamed
        if (!string.Equals(category.Name, name, StringComparison.Ordinal))
        {
            var affectedProducts = await _db.Products.Where(p => p.Category == category.Name).ToListAsync();
            foreach (var p in affectedProducts) p.Category = name;
        }

        category.Name = name;
        category.Slug = slug;
        category.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        category.IsActive = dto.IsActive;
        category.DisplayOrder = dto.DisplayOrder;
        category.UpdatedAt = DateTime.UtcNow;

        if (dto.RemoveImage && !string.IsNullOrEmpty(category.Image))
        {
            DeleteImageFile(category.Image);
            category.Image = null;
        }

        if (dto.Image != null)
        {
            if (!string.IsNullOrEmpty(category.Image)) DeleteImageFile(category.Image);
            category.Image = await SaveImageAsync(dto.Image);
        }

        await _db.SaveChangesAsync();

        var count = await _db.Products.CountAsync(p => p.Category == category.Name);
        return Ok(ApiResponse<CategoryResponseDto>.Ok(MapToDto(category, count), "Category updated."));
    }

    // DELETE: api/categories/5  (admin only)
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var category = await _db.Categories.FindAsync(id);
        if (category == null)
            return NotFound(ApiResponse<object>.Fail("Category not found."));

        var inUse = await _db.Products.AnyAsync(p => p.Category == category.Name);
        if (inUse)
            return BadRequest(ApiResponse<object>.Fail("Cannot delete: products are still assigned to this category. Reassign or delete them first."));

        if (!string.IsNullOrEmpty(category.Image)) DeleteImageFile(category.Image);

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { }, "Category deleted."));
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private static CategoryResponseDto MapToDto(Category c, int productCount) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Slug = c.Slug,
        Description = c.Description,
        Image = c.Image,
        IsActive = c.IsActive,
        DisplayOrder = c.DisplayOrder,
        ProductCount = productCount,
        CreatedAt = c.CreatedAt
    };

    private static string Slugify(string input)
    {
        var slug = input.Trim().ToLowerInvariant();
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-").Trim('-');
        return slug;
    }

    private async Task<string> SaveImageAsync(IFormFile file)
    {
        var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "categories");
        Directory.CreateDirectory(uploadsFolder);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/categories/{fileName}";
    }

    private void DeleteImageFile(string relativePath)
    {
        try
        {
            var fullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", relativePath.TrimStart('/'));
            if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
        }
        catch
        {
            // non-critical — ignore file cleanup failures
        }
    }
}