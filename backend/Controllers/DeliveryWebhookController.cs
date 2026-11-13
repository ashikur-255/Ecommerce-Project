using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/delivery/steadfast")]
public class DeliveryWebhookController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SteadfastCourierService _steadfast;

    public DeliveryWebhookController(AppDbContext db, SteadfastCourierService steadfast)
    {
        _db = db;
        _steadfast = steadfast;
    }

    // POST /api/delivery/steadfast/webhook
    [HttpPost("webhook")]
    [AllowAnonymous] // Steadfast can't send your JWT — auth is via the bearer token check below
    public async Task<IActionResult> Webhook([FromBody] SteadfastWebhookPayload payload)
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        if (!_steadfast.IsValidWebhookToken(authHeader))
            return Unauthorized(new { error = "Invalid webhook token" });

        var order = await _db.Orders
            .FirstOrDefaultAsync(o => o.ConsignmentId == payload.ConsignmentId.ToString());

        if (order is null)
            return NotFound(new { error = "Order not found for this consignment" });

        order.DeliveryStatus = payload.Status;

        // Map Steadfast statuses onto your own OrderStatus/PaymentStatus
        if (payload.Status == "delivered")
        {
            order.OrderStatus = "delivered";
            order.PaymentStatus = "paid";
        }
        else if (payload.Status == "cancelled")
        {
            order.OrderStatus = "cancelled";
        }

        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { status = "success" });
    }
}