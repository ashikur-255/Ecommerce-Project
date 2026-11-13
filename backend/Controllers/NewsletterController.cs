using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NewsletterController : ControllerBase
{
    private readonly AppDbContext _db;

    public NewsletterController(AppDbContext db)
    {
        _db = db;
    }

    // POST: api/newsletter/subscribe
    [HttpPost("subscribe")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<NewsletterResponseDto>>> Subscribe([FromBody] NewsletterSubscribeDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();

        var alreadySubscribed = await _db.NewsletterSubscribers.AnyAsync(s => s.Email == email);
        if (alreadySubscribed)
            return Conflict(ApiResponse<NewsletterResponseDto>.Fail("Email exists"));

        var subscriber = new NewsletterSubscriber
        {
            Email = email,
            IsActive = true,
            SubscribedAt = DateTime.UtcNow
        };

        _db.NewsletterSubscribers.Add(subscriber);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Safety net against a race condition on the unique index
            return Conflict(ApiResponse<NewsletterResponseDto>.Fail("Email exists"));
        }

        return Ok(ApiResponse<NewsletterResponseDto>.Ok(new NewsletterResponseDto
        {
            Email = subscriber.Email,
            SubscribedAt = subscriber.SubscribedAt
        }, "Subscribed successfully."));
    }

    // GET: api/newsletter  (admin only — list subscribers)
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<ApiResponse<List<NewsletterResponseDto>>>> GetAll()
    {
        var list = await _db.NewsletterSubscribers
            .OrderByDescending(s => s.SubscribedAt)
            .Select(s => new NewsletterResponseDto { Email = s.Email, SubscribedAt = s.SubscribedAt })
            .ToListAsync();

        return Ok(ApiResponse<List<NewsletterResponseDto>>.Ok(list));
    }
}