using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
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

        Order? order = null;
        if (payload.ConsignmentId > 0)
        {
            order = await _db.Orders.FirstOrDefaultAsync(o => o.ConsignmentId == payload.ConsignmentId.ToString());
        }

        if (order is null && !string.IsNullOrWhiteSpace(payload.Invoice))
        {
            var cleanInvoice = payload.Invoice.Trim();
            if (cleanInvoice.StartsWith("ORD-", StringComparison.OrdinalIgnoreCase) &&
                int.TryParse(cleanInvoice.Substring(4), out var orderId))
            {
                order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
            }
        }

        if (order is null)
            return NotFound(new { error = "Order not found for this consignment" });

        order.DeliveryStatus = payload.Status;

        // Map Steadfast statuses onto your own OrderStatus/PaymentStatus
        var normalizedStatus = payload.Status?.ToLowerInvariant() ?? "";
        if (normalizedStatus == "delivered")
        {
            order.OrderStatus = "delivered";
            order.PaymentStatus = "paid";

            if (string.Equals(order.PaymentMethod, "cashondelivery", StringComparison.OrdinalIgnoreCase))
            {
                var codPayment = await _db.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);
                if (codPayment != null)
                {
                    codPayment.Status = PaymentState.Completed;
                    codPayment.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
        else if (normalizedStatus == "cancelled")
        {
            order.OrderStatus = "cancelled";
        }

        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { status = "success" });
    }
}