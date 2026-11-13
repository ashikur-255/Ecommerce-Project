using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace EcommerceAPI.Models;

[Index(nameof(Email), IsUnique = true)]
public class NewsletterSubscriber
{
    public int Id { get; set; }

    [Required, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
}