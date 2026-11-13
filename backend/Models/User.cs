using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceAPI.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(200)]
    [EmailAddress]
    public string? Email { get; set; }  // Made nullable

    [MaxLength(20)]
    public string? Phone { get; set; }  // Already nullable

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Role { get; set; } = "customer";

    [MaxLength(500)]
    public string? Avatar { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Email Verification
    public bool IsEmailVerified { get; set; } = false;
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationTokenExpiry { get; set; }

    // Phone Verification - Match database column names
    public bool IsPhoneVerified { get; set; } = false;
    public string? PhoneVerificationCode { get; set; }  // Changed from PhoneVerificationToken
    public DateTime? PhoneVerificationCodeExpiry { get; set; }  // Changed from PhoneVerificationTokenExpiry

    // Reset Password
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    // Navigation
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}