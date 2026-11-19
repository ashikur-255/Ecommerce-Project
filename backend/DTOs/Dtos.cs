using System.ComponentModel.DataAnnotations;

namespace EcommerceAPI.DTOs;

// ═══════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════
public class RegisterDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }  // Made optional

    [MaxLength(20)]
    public string? Phone { get; set; }  // Added phone

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [EmailAddress]
    public string? Email { get; set; }

    public string? Phone { get; set; }

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = new();
}

public class UserDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Role { get; set; } = string.Empty;

    public string? Avatar { get; set; }

    public bool IsEmailVerified { get; set; }

    public bool IsPhoneVerified { get; set; }
}

public class VerifyPhoneDto
{
    [Required]
    public string Code { get; set; } = string.Empty;
}


public class UpdateProfileDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [MinLength(6)]
    public string? NewPassword { get; set; }
    public IFormFile? Avatar { get; set; }
}

// ═══════════════════════════════════════════════════════
//  PRODUCT
// ═══════════════════════════════════════════════════════
public class CreateProductDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [MaxLength(2000)] public string Description { get; set; } = string.Empty;
    [Range(0, 9999999)] public decimal Price { get; set; }
    [Range(0, 9999999)] public decimal OriginalPrice { get; set; }
    [Required, MaxLength(100)] public string Category { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string Brand { get; set; } = string.Empty;
    public IFormFileCollection? Images { get; set; }
    public List<string> ImageUrls { get; set; } = new();

    public List<string> Sizes { get; set; } = new();
    public List<string> Colors { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public int Stock { get; set; }
    public bool IsNew { get; set; }
    public bool IsFeatured { get; set; }
}

public class ProductResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public List<string> Sizes { get; set; } = new();
    public List<string> Colors { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public int Stock { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsNew { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ProductQueryDto
{
    public string? Search { get; set; }
    public string? Category { get; set; }
    public string? Brand { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string SortBy { get; set; } = "createdAt";
    public string SortOrder { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 12;
    public bool? IsNew { get; set; }
    public bool? IsFeatured { get; set; }
}

public class ProductListResponseDto
{
    public List<ProductResponseDto> Products { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int TotalPages { get; set; }
}

// ═══════════════════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════════════════
public class AddToCartDto
{
    [Required] public int ProductId { get; set; }
    [Range(1, 100)] public int Quantity { get; set; } = 1;
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class UpdateCartItemDto
{
    [Required] public int ProductId { get; set; }
    [Range(0, 100)] public int Quantity { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class CartItemResponseDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public ProductResponseDto Product { get; set; } = new();
}

public class CartResponseDto
{
    public List<CartItemResponseDto> Items { get; set; } = new();
    public int ItemCount { get; set; }
    public decimal Total { get; set; }
}

// ═══════════════════════════════════════════════════════
//  ORDER
// ═══════════════════════════════════════════════════════
public class CreateOrderDto
{
    [Required]
    public List<OrderItemInputDto> OrderItems { get; set; } = new();

    [Required]
    public ShippingAddressDto ShippingAddress { get; set; } = new();

    public string? PaymentIntentId { get; set; }

    public string PaymentMethod { get; set; } = "Stripe";
}

public class OrderItemInputDto
{
    [Required] public int ProductId { get; set; }
    [Range(1, 100)] public int Quantity { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class ShippingAddressDto
{
    [Required, MaxLength(200)] public string FullName { get; set; } = string.Empty;
    [Required, MaxLength(300)] public string Address { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string City { get; set; } = string.Empty;
    [MaxLength(20)] public string PostalCode { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string Country { get; set; } = string.Empty;
    [MaxLength(30)] public string Phone { get; set; } = string.Empty;
}

public class OrderResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public List<OrderItemResponseDto> OrderItems { get; set; } = new();
    public ShippingAddressDto ShippingAddress { get; set; } = new();
    public decimal SubTotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Tax { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? ConsignmentId { get; set; }
    public string? TrackingCode { get; set; }
    public string? DeliveryStatus { get; set; }
}

public class OrderItemResponseDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductImage { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class UpdateOrderStatusDto
{
    [Required] public string Status { get; set; } = string.Empty;
}

public class VerifyEmailDto
{
    public string Token { get; set; } = string.Empty;
}

public class ResendVerificationDto
{
    [EmailAddress]
    public string? Email { get; set; }

    public string? Phone { get; set; }

    [Required]
    public string Type { get; set; } = "email";  // "email" or "phone"
}

public class ForgotPasswordDto
{
    [EmailAddress]
    public string? Email { get; set; }

    public string? Phone { get; set; }
}

public class VerifyPhonePublicDto
{
    [Required]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(6)]
    public string Code { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    public string ConfirmPassword { get; set; } = string.Empty;
}

// ═══════════════════════════════════════════════════════
//  PAYMENT (Stripe)
// ═══════════════════════════════════════════════════════
public class CreatePaymentIntentDto
{
    [Range(1, 9999999)] public decimal Amount { get; set; }
    public string Currency { get; set; } = "bdt";
}

public class PaymentIntentResponseDto
{
    public string ClientSecret { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
}

// ═══════════════════════════════════════════════════════
//  REVIEW
// ═══════════════════════════════════════════════════════
public class CreateReviewDto
{
    [Required] public int ProductId { get; set; }
    [Range(1, 5)] public int Rating { get; set; }
    [Required, MaxLength(1000)] public string Comment { get; set; } = string.Empty;
}

public class ReviewResponseDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// ═══════════════════════════════════════════════════════
//  GENERIC API RESPONSE WRAPPER
// ═══════════════════════════════════════════════════════
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Success") =>
        new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message) =>
        new() { Success = false, Message = message };
}

// ═══════════════════════════════════════════════════════
//  CATEGORY
// ═══════════════════════════════════════════════════════
public class CreateCategoryDto
{
    [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    [MaxLength(500)] public string? Description { get; set; }
    public IFormFile? Image { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
}

public class UpdateCategoryDto
{
    [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    [MaxLength(500)] public string? Description { get; set; }
    public IFormFile? Image { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
    public bool RemoveImage { get; set; } = false;
}

public class CategoryResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Image { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public int ProductCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ═══════════════════════════════════════════════════════
//  NEWSLETTER
// ═══════════════════════════════════════════════════════
public class NewsletterSubscribeDto
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
}

public class NewsletterResponseDto
{
    public string Email { get; set; } = string.Empty;
    public DateTime SubscribedAt { get; set; }
}

// ═══════════════════════════════════════════════════════
//  MOBILE FINANCIAL SERVICES (bKash / Nagad / Rocket)
//  Same shape reused for every wallet provider you add later.
// ═══════════════════════════════════════════════════════
public class CreateMfsPaymentDto
{
    [Range(1, 9999999)] public decimal Amount { get; set; }
    public string Currency { get; set; } = "BDT";
}

public class MfsPaymentCreateResponseDto
{
    public string Provider { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public string RedirectUrl { get; set; } = string.Empty;
}

public class MfsTransactionResponseDto
{
    public int Id { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string ProviderPaymentId { get; set; } = string.Empty;
    public string? ProviderTrxId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// ═══════════════════════════════════════════════════════
//  UNIFIED PAYMENT (cross-provider reporting)
// ═══════════════════════════════════════════════════════
public class PaymentResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? OrderId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string? ProviderReference { get; set; }
    public string? ProviderTransactionId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? FailureReason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PaymentListResponseDto
{
    public List<PaymentResponseDto> Payments { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int TotalPages { get; set; }
}

public class SslCommerzCreateResponseDto
{
    public int OrderId { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string GatewayPageUrl { get; set; } = string.Empty;
}


public class SteadfastCreateOrderRequest
{
    public string Invoice { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string RecipientAddress { get; set; } = string.Empty;
    public decimal CodAmount { get; set; }
    public string? Note { get; set; }
}

public class SteadfastConsignment
{
    public long ConsignmentId { get; set; }
    public string Invoice { get; set; } = string.Empty;
    public string TrackingCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class SteadfastCreateOrderResponse
{
    public int Status { get; set; }
    public string? Message { get; set; }
    public SteadfastConsignment? Consignment { get; set; }
}

// ── Webhook payload Steadfast POSTs to you ────────────────────────────────
public class SteadfastWebhookPayload
{
    public long ConsignmentId { get; set; }
    public string Invoice { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? CodAmount { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class WishlistDto
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public decimal OriginalPrice { get; set; }

    public string Image { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Brand { get; set; } = string.Empty;

    public bool IsNew { get; set; }

    public bool IsFeatured { get; set; }

    public DateTime AddedAt { get; set; }
}