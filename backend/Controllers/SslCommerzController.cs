using System.Security.Claims;
using EcommerceAPI.Data;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;
using EcommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Controllers;

/// <summary>
/// SSLCommerz's flow is meaningfully different from Stripe/bKash: its
/// success/fail/cancel/ipn callbacks land as server-to-server POSTs on YOUR
/// API directly — never on the React SPA. That means the order has to exist
/// *before* the redirect to SSLCommerz's page, not after (there's no "the
/// frontend calls POST /api/orders once payment succeeds" step here, because
/// the frontend is never involved in the confirmation at all).
/// </summary>
[ApiController]
[Route("api/sslcommerz")]
public class SslCommerzController : ControllerBase
{
    private readonly SslCommerzService _ssl;
    private readonly AppDbContext _db;
    private readonly PaymentRecordService _paymentRecordService;
    private readonly IConfiguration _config;

    public SslCommerzController(
        SslCommerzService ssl,
        AppDbContext db,
        PaymentRecordService paymentRecordService,
        IConfiguration config)
    {
        _ssl = ssl;
        _db = db;
        _paymentRecordService = paymentRecordService;
        _config = config;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string FrontendUrl => _config["SSLCommerz:FrontendUrl"] ?? "http://localhost:5173";

    // POST /api/sslcommerz/create-payment  (auth required)
    // Accepts the same shape as POST /api/orders (order items + shipping
    // address) because — unlike Stripe/bKash — the order has to be created
    // right now, before we ever talk to SSLCommerz.
    [HttpPost("create-payment")]
    [Authorize]
    public async Task<IActionResult> CreatePayment([FromBody] CreateOrderDto dto)
    {
        if (!dto.OrderItems.Any())
            return BadRequest(ApiResponse<string>.Fail("Order must have at least one item."));

        var storeId = _config["SSLCommerz:StoreId"] ?? Environment.GetEnvironmentVariable("SSLCommerz__StoreId");
        var storePasswd = _config["SSLCommerz:StorePasswd"] ?? Environment.GetEnvironmentVariable("SSLCommerz__StorePasswd");

        if (string.IsNullOrWhiteSpace(storeId) || string.IsNullOrWhiteSpace(storePasswd) || storeId == "your_store_id")
        {
            return BadRequest(ApiResponse<string>.Fail("SSLCommerz gateway is currently being configured. Please choose Cash on Delivery to place your order immediately."));
        }

        decimal subTotal = 0;
        var orderItems = new List<OrderItem>();

        foreach (var item in dto.OrderItems)
        {
            var product = await _db.Products.FindAsync(item.ProductId);
            if (product is null)
                return BadRequest(ApiResponse<string>.Fail($"Product {item.ProductId} not found."));
            if (product.Stock < item.Quantity)
                return BadRequest(ApiResponse<string>.Fail($"Insufficient stock for '{product.Name}'. Available: {product.Stock}."));

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
            product.Stock -= item.Quantity;
        }

        decimal shippingCost = subTotal > 2000 ? 0m : 100m;
        decimal tax = Math.Round(subTotal * 0.05m, 2);
        decimal grandTotal = subTotal + shippingCost + tax;

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
            ShippingCost = shippingCost,
            Tax = tax,
            TotalAmount = grandTotal,
            PaymentMethod = "sslcommerz",
            PaymentStatus = "pending",
            OrderStatus = "processing",
            OrderItems = orderItems
        };

        _db.Orders.Add(order);

        var cartItems = await _db.CartItems.Where(c => c.UserId == UserId).ToListAsync();
        _db.CartItems.RemoveRange(cartItems);

        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(UserId);
        var tranId = $"ORDER-{order.Id}-{DateTime.UtcNow:yyyyMMddHHmmss}";

        try
        {
            var initResult = await _ssl.InitiateAsync(new SslInitRequest
            {
                UserId = UserId,
                OrderId = order.Id,
                Amount = grandTotal,
                Currency = "BDT",
                TransactionId = tranId,
                CustomerName = dto.ShippingAddress.FullName,
                CustomerEmail = user?.Email ?? "customer@example.com",
                CustomerPhone = dto.ShippingAddress.Phone,
                CustomerAddress = dto.ShippingAddress.Address,
                CustomerCity = dto.ShippingAddress.City,
                CustomerCountry = dto.ShippingAddress.Country
            });

            if (!initResult.Status.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase))
                return BadRequest(ApiResponse<string>.Fail($"SSLCommerz rejected the request: {initResult.Failedreason}"));

            order.PaymentIntentId = tranId;
            await _db.SaveChangesAsync();

            await _paymentRecordService.RecordAsync(
                UserId, PaymentProvider.SslCommerz, grandTotal, "BDT",
                providerReference: tranId, status: PaymentState.Pending, orderId: order.Id);

            return Ok(ApiResponse<SslCommerzCreateResponseDto>.Ok(new SslCommerzCreateResponseDto
            {
                OrderId = order.Id,
                TransactionId = tranId,
                GatewayPageUrl = initResult.GatewayPageURL
            }));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail($"Failed to initiate SSLCommerz payment: {ex.Message}"));
        }
    }

    // POST /api/sslcommerz/success|fail|cancel — SSLCommerz POSTs the
    // customer's browser here directly (not to the SPA) after they finish.
    [HttpPost("success")]
    [AllowAnonymous]
    public Task<IActionResult> Success([FromForm] IFormCollection form) => HandleRedirectAsync(form, "success");

    [HttpPost("fail")]
    [AllowAnonymous]
    public Task<IActionResult> Fail([FromForm] IFormCollection form) => HandleRedirectAsync(form, "failed");

    [HttpPost("cancel")]
    [AllowAnonymous]
    public Task<IActionResult> Cancel([FromForm] IFormCollection form) => HandleRedirectAsync(form, "cancelled");

    private async Task<IActionResult> HandleRedirectAsync(IFormCollection form, string outcome)
    {
        var tranId = form["tran_id"].ToString();
        var valId = form["val_id"].ToString();

        if (string.IsNullOrEmpty(tranId))
            return Redirect($"{FrontendUrl}/checkout/payment-result?provider=sslcommerz&status=failed&reason=missing_tran_id");

        var order = await _db.Orders.FirstOrDefaultAsync(o => o.PaymentIntentId == tranId);
        if (order == null)
            return Redirect($"{FrontendUrl}/checkout/payment-result?provider=sslcommerz&status=failed&reason=order_not_found");

        if (outcome != "success" || string.IsNullOrEmpty(valId))
        {
            order.PaymentStatus = outcome == "cancelled" ? "pending" : "failed";
            if (outcome == "failed") order.OrderStatus = "cancelled";
            order.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await _paymentRecordService.UpdateStatusByReferenceAsync(
                PaymentProvider.SslCommerz, tranId,
                outcome == "cancelled" ? PaymentState.Cancelled : PaymentState.Failed);

            return Redirect($"{FrontendUrl}/checkout/payment-result?provider=sslcommerz&status={outcome}&orderId={order.Id}");
        }

        // Never trust the redirect alone — re-validate directly with SSLCommerz.
        try
        {
            var validation = await _ssl.ValidateAsync(valId);
            var isValid = validation.Status is "VALID" or "VALIDATED";

            if (isValid && order.PaymentStatus != "paid")
            {
                order.PaymentStatus = "paid";
                order.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                await _paymentRecordService.UpdateStatusByReferenceAsync(
                    PaymentProvider.SslCommerz, tranId, PaymentState.Completed,
                    providerTransactionId: validation.Bank_tran_id);
            }
            else if (!isValid)
            {
                order.PaymentStatus = "failed";
                order.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                await _paymentRecordService.UpdateStatusByReferenceAsync(
                    PaymentProvider.SslCommerz, tranId, PaymentState.Failed,
                    failureReason: $"Validation returned status: {validation.Status}");
            }

            var resultStatus = isValid ? "success" : "failed";
            return Redirect($"{FrontendUrl}/checkout/payment-result?provider=sslcommerz&status={resultStatus}&orderId={order.Id}");
        }
        catch
        {
            return Redirect($"{FrontendUrl}/checkout/payment-result?provider=sslcommerz&status=failed&orderId={order.Id}");
        }
    }

    // POST /api/sslcommerz/ipn — server-to-server, no browser involved. This
    // is SSLCommerz's recommended source of truth precisely because it fires
    // even if the customer closes their browser before the redirect completes.
    [HttpPost("ipn")]
    [AllowAnonymous]
    public async Task<IActionResult> Ipn([FromForm] IFormCollection form)
    {
        var dict = form.ToDictionary(kv => kv.Key, kv => kv.Value.ToString());

        if (!_ssl.VerifyIpnHash(dict))
            return BadRequest("Invalid IPN signature.");

        var tranId = dict.GetValueOrDefault("tran_id", "");
        var valId = dict.GetValueOrDefault("val_id", "");

        var order = await _db.Orders.FirstOrDefaultAsync(o => o.PaymentIntentId == tranId);
        if (order == null) return NotFound();

        try
        {
            var validation = await _ssl.ValidateAsync(valId);
            var isValid = validation.Status is "VALID" or "VALIDATED";

            if (isValid && order.PaymentStatus != "paid")
            {
                order.PaymentStatus = "paid";
                order.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                await _paymentRecordService.UpdateStatusByReferenceAsync(
                    PaymentProvider.SslCommerz, tranId, PaymentState.Completed,
                    providerTransactionId: validation.Bank_tran_id);
            }

            return Ok();
        }
        catch
        {
            return StatusCode(500);
        }
    }

    // GET /api/sslcommerz/status/{orderId}  (auth — frontend polling helper, not currently required by the flow above)
    [HttpGet("status/{orderId:int}")]
    [Authorize]
    public async Task<IActionResult> GetStatus(int orderId)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == UserId);
        if (order == null) return NotFound(ApiResponse<string>.Fail("Order not found."));

        return Ok(ApiResponse<object>.Ok(new
        {
            orderId = order.Id,
            paymentStatus = order.PaymentStatus,
            orderStatus = order.OrderStatus
        }));
    }
}