using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
using EcommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EcommerceAPI.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PaymentRecordService _paymentRecordService;
    private readonly SteadfastCourierService _steadfast;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        AppDbContext db,
        PaymentRecordService paymentRecordService,
        SteadfastCourierService steadfast,
        ILogger<OrdersController> logger)
    {
        _db = db;
        _paymentRecordService = paymentRecordService;
        _steadfast = steadfast;
        _logger = logger;
    }

    private int UserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/orders
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        if (!dto.OrderItems.Any())
            return BadRequest(ApiResponse<string>.Fail("Order must have at least one item."));

        // ── Validate products & build order items ─────────────────────────────
        decimal subTotal = 0;
        var orderItems = new List<OrderItem>();

        foreach (var item in dto.OrderItems)
        {
            var product = await _db.Products.FindAsync(item.ProductId);

            if (product is null)
                return BadRequest(ApiResponse<string>.Fail($"Product {item.ProductId} not found."));

            if (product.Stock < item.Quantity)
                return BadRequest(ApiResponse<string>
                    .Fail($"Insufficient stock for '{product.Name}'. Available: {product.Stock}."));

            // Snapshot values at purchase time
            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductImage = product.Images?.Split('|').FirstOrDefault() ?? string.Empty,
                Price = product.Price,
                Quantity = item.Quantity,
                Size = item.Size,
                Color = item.Color
            });

            subTotal += product.Price * item.Quantity;

            // Decrement stock
            product.Stock -= item.Quantity;
        }

        decimal shipping = subTotal > 2000 ? 0m : 100m;
        decimal tax = Math.Round(subTotal * 0.05m, 2);

        string paymentMethod =
            dto.PaymentMethod?.ToLower() ?? "stripe";

        string paymentStatus =
            paymentMethod == "cashondelivery"
                ? "pending"
                : "paid";

        var order = new Order
        {
            UserId = UserId,

            ShipFullName = dto.ShippingAddress.FullName,
            ShipAddress = dto.ShippingAddress.Address,
            ShipCity = dto.ShippingAddress.City,
            ShipPostalCode = dto.ShippingAddress.PostalCode,
            ShipCountry = dto.ShippingAddress.Country,
            ShipPhone = dto.ShippingAddress.Phone,

            SubTotal = subTotal,
            ShippingCost = shipping,
            Tax = tax,
            TotalAmount = subTotal + shipping + tax,

            PaymentMethod = paymentMethod,
            PaymentStatus = paymentStatus,
            PaymentIntentId = dto.PaymentIntentId,

            OrderStatus = "processing",

            OrderItems = orderItems
        };

        _db.Orders.Add(order);

        // Clear the user's cart
        var cartItems = await _db.CartItems.Where(c => c.UserId == UserId).ToListAsync();
        _db.CartItems.RemoveRange(cartItems);

        await _db.SaveChangesAsync();

        // ── Unified Payment table bookkeeping ──────────────────────────────
        // Stripe/bKash already have a Payment row from their create-intent /
        // create-payment step (before this order existed) — just attach the
        // OrderId now that we have one. COD never had a prior row, so create
        // it fresh.
        if (paymentMethod == "cashondelivery")
        {
            await _paymentRecordService.RecordAsync(
                UserId, PaymentProvider.CashOnDelivery, order.TotalAmount, "BDT",
                status: PaymentState.Pending, orderId: order.Id);
        }
        else if (paymentMethod == "stripe" && !string.IsNullOrEmpty(dto.PaymentIntentId))
        {
            var existingPayment = await _db.Payments.FirstOrDefaultAsync(p =>
                p.Provider == PaymentProvider.Stripe &&
                (p.ProviderReference == dto.PaymentIntentId || p.ProviderTransactionId == dto.PaymentIntentId));

            if (existingPayment != null)
            {
                // Row already exists from create-intent step — link + mark Completed.
                // (By the time CreateOrder runs, the frontend has already confirmed
                // payment succeeded with Stripe, so we don't need to wait for the webhook.)
                existingPayment.OrderId = order.Id;
                existingPayment.Status = PaymentState.Completed;
                existingPayment.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // No row found (e.g. webhook/create-intent step was skipped) — create one now
                // so the order is never "paid" without a matching Payment record.
                _db.Payments.Add(new Payment
                {
                    UserId = UserId,
                    Provider = PaymentProvider.Stripe,
                    Amount = order.TotalAmount,
                    Currency = "BDT",
                    ProviderReference = dto.PaymentIntentId,
                    Status = PaymentState.Completed,
                    OrderId = order.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                });
            }

            await _db.SaveChangesAsync();
        }
        else if (paymentMethod == "bkash" && !string.IsNullOrEmpty(dto.PaymentIntentId))
        {
            // dto.PaymentIntentId carries bKash's trxID here (see PaymentResultPage.tsx),
            // which LinkOrderAsync matches against ProviderTransactionId.
            await _paymentRecordService.LinkOrderAsync(PaymentProvider.Bkash, dto.PaymentIntentId, order.Id);
        }

        return Ok(ApiResponse<OrderResponseDto>.Ok(MapOrder(order), "Order placed successfully."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/orders/my
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("my")]
    public async Task<IActionResult> GetMyOrders(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        var query = _db.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.UserId == UserId)
            .OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync();
        var orders = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            orders = orders.Select(MapOrder),
            total,
            page,
            totalPages = (int)Math.Ceiling((double)total / limit)
        }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/orders/{id}
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _db.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return NotFound(ApiResponse<string>.Fail("Order not found."));

        if (order.UserId != UserId && !User.IsInRole("admin"))
            return Forbid();

        return Ok(ApiResponse<OrderResponseDto>.Ok(MapOrder(order)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/orders  [Admin]
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string? status = null)
    {
        var query = _db.Orders
            .Include(o => o.OrderItems)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(o => o.OrderStatus == status);

        var total = await query.CountAsync();
        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            orders = orders.Select(MapOrder),
            total,
            page,
            totalPages = (int)Math.Ceiling((double)total / limit)
        }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/orders/{id}/status  [Admin]
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var allowed = new[] { "processing", "shipped", "delivered", "cancelled" };

        if (!allowed.Contains(dto.Status, StringComparer.OrdinalIgnoreCase))
            return BadRequest(ApiResponse<string>.Fail($"Invalid status. Allowed: {string.Join(", ", allowed)}"));

        var order = await _db.Orders.Include(o => o.OrderItems).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null)
            return NotFound(ApiResponse<string>.Fail("Order not found."));

        var newStatus = dto.Status.ToLower();

        // ── NEW: restore stock when an order transitions INTO "cancelled" ─────
        // (guarded so it never double-restores if somehow called twice)
        if (newStatus == "cancelled" && order.OrderStatus != "cancelled")
        {
            foreach (var item in order.OrderItems)
            {
                var product = await _db.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    product.Stock += item.Quantity;
                }
            }
        }

        // ── Create Steadfast consignment the first time an order goes "shipped" (if configured) ──
        if (newStatus == "shipped" && string.IsNullOrEmpty(order.ConsignmentId))
        {
            if (_steadfast.IsConfigured)
            {
                try
                {
                    var codAmount = order.PaymentMethod == "cashondelivery" ? order.TotalAmount : 0m;

                    var result = await _steadfast.CreateOrderAsync(new SteadfastCreateOrderRequest
                    {
                        Invoice = $"ORD-{order.Id}",
                        RecipientName = order.ShipFullName,
                        RecipientPhone = order.ShipPhone,
                        RecipientAddress = $"{order.ShipAddress}, {order.ShipCity}, {order.ShipPostalCode}",
                        CodAmount = codAmount,
                        Note = $"Order #{order.Id}"
                    });

                    if (result?.Consignment != null)
                    {
                        order.ConsignmentId = result.Consignment.ConsignmentId.ToString();
                        order.TrackingCode = result.Consignment.TrackingCode;
                        order.DeliveryStatus = result.Consignment.Status;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Steadfast courier booking failed for order #{OrderId}: {Message}. Continuing status update.", order.Id, ex.Message);
                    // Do NOT fail the order status update if external courier is unavailable or unconfigured
                }
            }
        }

        order.OrderStatus = newStatus;

        if (newStatus == "delivered" && order.PaymentStatus == "pending")
        {
            order.PaymentStatus = "paid";
            if (order.PaymentMethod == "cashondelivery")
            {
                var codPayment = await _db.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);
                if (codPayment != null) { codPayment.Status = PaymentState.Completed; codPayment.UpdatedAt = DateTime.UtcNow; }
            }
        }

        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok(order.OrderStatus, "Order status updated successfully."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/orders/{id}/payment  [Admin]
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPut("{id:int}/payment")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusDto dto)
    {
        var allowed = new[] { "pending", "paid", "failed", "refunded" };
        if (!allowed.Contains(dto.PaymentStatus, StringComparer.OrdinalIgnoreCase))
            return BadRequest(ApiResponse<string>.Fail(
                $"Invalid payment status. Allowed: {string.Join(", ", allowed)}"));

        var order = await _db.Orders.FindAsync(id);
        if (order is null)
            return NotFound(ApiResponse<string>.Fail("Order not found."));

        var newPaymentStatus = dto.PaymentStatus.ToLower();
        order.PaymentStatus = newPaymentStatus;
        order.UpdatedAt = DateTime.UtcNow;

        // ── NEW: keep the unified Payments table in sync ──────────────────────
        var mappedState = MapToPaymentState(newPaymentStatus);
        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);

        if (payment != null)
        {
            // Existing payment row (Stripe/bKash/COD) — just sync its status
            payment.Status = mappedState;
            payment.UpdatedAt = DateTime.UtcNow;
        }
        else if (mappedState == PaymentState.Completed)
        {
            // No payment row exists yet (e.g. legacy order created before this
            // feature, or admin marking an order paid manually) — create one so
            // it shows up correctly in the Payments admin page.
            _db.Payments.Add(new Payment
            {
                UserId = order.UserId,
                Provider = MapProviderFromMethod(order.PaymentMethod),
                Amount = order.TotalAmount,
                Currency = "BDT",
                Status = PaymentState.Completed,
                OrderId = order.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok(order.PaymentStatus, "Payment status updated."));
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────
    private static PaymentState MapToPaymentState(string orderPaymentStatus) => orderPaymentStatus switch
    {
        "paid" => PaymentState.Completed,
        "pending" => PaymentState.Pending,
        "failed" => PaymentState.Failed,
        "refunded" => PaymentState.Refunded,
        _ => PaymentState.Pending, // "refunded" ইত্যাদি — নিচের নোট দেখো
    };

    private static PaymentProvider MapProviderFromMethod(string paymentMethod) => paymentMethod?.ToLower() switch
    {
        "stripe" => PaymentProvider.Stripe,
        "bkash" => PaymentProvider.Bkash,
        "nagad" => PaymentProvider.Nagad,
        "rocket" => PaymentProvider.Rocket,
        _ => PaymentProvider.CashOnDelivery,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/orders/{id}  [Admin]
    // ─────────────────────────────────────────────────────────────────────────
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null)
            return NotFound(ApiResponse<string>.Fail("Order not found."));

        // Remove any linked Payment rows first to avoid FK constraint failure
        var payments = await _db.Payments.Where(p => p.OrderId == id).ToListAsync();
        if (payments.Any())
            _db.Payments.RemoveRange(payments);

        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Deleted", "Order deleted."));
    }

    // User can cancel only processing orders
    [HttpPut("{id:int}/cancel")]
    public async Task<IActionResult> CancelMyOrder(int id)
    {
        var order = await _db.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == UserId);

        if (order is null)
            return NotFound(ApiResponse<string>.Fail("Order not found."));

        if (order.OrderStatus != "processing")
            return BadRequest(ApiResponse<string>.Fail("Only processing orders can be cancelled."));

        // ── NEW: restore stock for every item in this order ───────────────────
        foreach (var item in order.OrderItems)
        {
            var product = await _db.Products.FindAsync(item.ProductId);
            if (product != null)
            {
                product.Stock += item.Quantity;
            }
        }

        order.OrderStatus = "cancelled";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Cancelled", "Order cancelled successfully."));
    }

    // DELETE /api/orders/{id}/my
    [HttpDelete("{id:int}/my")]
    public async Task<IActionResult> DeleteMyOrder(int id)
    {
        var order = await _db.Orders
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == UserId);

        if (order is null)
            return NotFound(ApiResponse<string>.Fail("Order not found."));

        if (order.OrderStatus != "cancelled")
            return BadRequest(ApiResponse<string>.Fail("Only cancelled orders can be deleted."));

        // Remove any linked Payment rows first to avoid FK constraint failure
        var payments = await _db.Payments.Where(p => p.OrderId == id).ToListAsync();
        if (payments.Any())
            _db.Payments.RemoveRange(payments);

        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Deleted", "Order deleted successfully."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mapping helper
    // ─────────────────────────────────────────────────────────────────────────
    private static OrderResponseDto MapOrder(Order o) => new()
    {
        Id = o.Id,
        UserId = o.UserId,
        ShippingAddress = new ShippingAddressDto
        {
            FullName = o.ShipFullName,
            Address = o.ShipAddress,
            City = o.ShipCity,
            PostalCode = o.ShipPostalCode,
            Country = o.ShipCountry,
            Phone = o.ShipPhone
        },
        SubTotal = o.SubTotal,
        ShippingCost = o.ShippingCost,
        Tax = o.Tax,
        TotalAmount = o.TotalAmount,
        PaymentStatus = o.PaymentStatus,
        PaymentMethod = o.PaymentMethod,
        OrderStatus = o.OrderStatus,
        PaymentIntentId = o.PaymentIntentId,
        CreatedAt = o.CreatedAt,
        UpdatedAt = o.UpdatedAt,
        ConsignmentId = o.ConsignmentId,
        TrackingCode = o.TrackingCode,
        DeliveryStatus = o.DeliveryStatus,
        OrderItems = o.OrderItems.Select(i => new OrderItemResponseDto
        {
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            ProductImage = i.ProductImage,
            Price = i.Price,
            Quantity = i.Quantity,
            Size = i.Size,
            Color = i.Color
        }).ToList()

    };

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/orders/backfill-payments  [Admin] — ONE-TIME USE, remove after running
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost("backfill-payments")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> BackfillMissingPayments()
    {
        var paidOrders = await _db.Orders
            .Where(o => o.PaymentStatus == "paid")
            .ToListAsync();

        int created = 0;

        foreach (var order in paidOrders)
        {
            var alreadyExists = await _db.Payments.AnyAsync(p => p.OrderId == order.Id);
            if (alreadyExists) continue;

            var provider = order.PaymentMethod?.ToLower() switch
            {
                "stripe" => PaymentProvider.Stripe,
                "bkash" => PaymentProvider.Bkash,
                "nagad" => PaymentProvider.Nagad,
                "rocket" => PaymentProvider.Rocket,
                "sslcommerz" => PaymentProvider.SslCommerz,
                _ => PaymentProvider.CashOnDelivery,
            };

            _db.Payments.Add(new Payment
            {
                UserId = order.UserId,
                Provider = provider,
                Amount = order.TotalAmount,
                Currency = "BDT",
                ProviderReference = order.PaymentIntentId,
                Status = PaymentState.Completed,
                OrderId = order.Id,
                CreatedAt = order.CreatedAt,
                UpdatedAt = DateTime.UtcNow,
            });

            created++;
        }

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok($"Backfilled {created} missing payment record(s).", "Backfill complete."));
    }
}

// ─── Extra DTO not in shared DTOs file ────────────────────────────────────────
public class UpdatePaymentStatusDto
{
    [System.ComponentModel.DataAnnotations.Required]
    public string PaymentStatus { get; set; } = string.Empty;
}

