using Microsoft.EntityFrameworkCore;
using EcommerceAPI.Models;

namespace EcommerceAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Category> Categories { get; set; }
    public DbSet<NewsletterSubscriber> NewsletterSubscribers { get; set; }
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();

    // ✅ fixed: this was accidentally typed as Payment instead of
    // PaymentTransaction — they are two different entities/tables.
    // PaymentTransactions = bKash-specific grant/execute bookkeeping.
    // Payments = unified cross-provider reporting table.
    public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        base.OnModelCreating(mb);

        // ── User ──────────────────────────────────────────────────────────────
        mb.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasDefaultValue("customer");
            e.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
        // ── Wishlist ──────────────────────────────────────────────────────────
        mb.Entity<Wishlist>(e =>
        {
            e.HasKey(x => x.Id);

            // One wishlist item per user per product
            e.HasIndex(x => new { x.UserId, x.ProductId })
                .IsUnique();

            e.Property(x => x.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            e.HasOne(x => x.User)
                .WithMany(u => u.Wishlists)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Product)
                .WithMany(p => p.Wishlists)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<PaymentTransaction>()
        .Property(x => x.Amount)
        .HasPrecision(18, 2);

        // ── Product ───────────────────────────────────────────────────────────
        mb.Entity<Product>(e =>
        {
            e.HasIndex(p => p.Category);
            e.HasIndex(p => p.Brand);
            e.HasIndex(p => p.IsNew);
            e.HasIndex(p => p.IsFeatured);
            e.Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(p => p.Rating).HasDefaultValue(0m);
            e.Property(p => p.ReviewCount).HasDefaultValue(0);
        });

        // ── CartItem ──────────────────────────────────────────────────────────
        mb.Entity<CartItem>(e =>
        {
            // Composite unique: one row per user+product+size+color combination
            e.HasIndex(c => new { c.UserId, c.ProductId, c.Size, c.Color }).IsUnique();

            e.HasOne(c => c.User)
             .WithMany(u => u.CartItems)
             .HasForeignKey(c => c.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.Product)
             .WithMany(p => p.CartItems)
             .HasForeignKey(c => c.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Order ─────────────────────────────────────────────────────────────
        mb.Entity<Order>(e =>
        {
            e.HasIndex(o => o.UserId);
            e.HasIndex(o => o.OrderStatus);
            e.HasIndex(o => o.PaymentStatus);
            e.Property(o => o.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(o => o.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            e.HasOne(o => o.User)
             .WithMany(u => u.Orders)
             .HasForeignKey(o => o.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── OrderItem ─────────────────────────────────────────────────────────
        mb.Entity<OrderItem>(e =>
        {
            e.HasOne(oi => oi.Order)
             .WithMany(o => o.OrderItems)
             .HasForeignKey(oi => oi.OrderId)
             .OnDelete(DeleteBehavior.Cascade);

            // No cascade from product – keep history even if product is deleted
            e.HasOne(oi => oi.Product)
             .WithMany(p => p.OrderItems)
             .HasForeignKey(oi => oi.ProductId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Review ────────────────────────────────────────────────────────────
        mb.Entity<Review>(e =>
        {
            // One review per user per product
            e.HasIndex(r => new { r.UserId, r.ProductId }).IsUnique();

            e.HasOne(r => r.User)
             .WithMany(u => u.Reviews)
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(r => r.Product)
             .WithMany(p => p.Reviews)
             .HasForeignKey(r => r.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Payment ───────────────────────────────────────────────────────────
        mb.Entity<Payment>(e =>
        {
            e.Property(x => x.Amount)
                .HasPrecision(18, 2);

            e.HasOne(p => p.Order)
                .WithMany()
                .HasForeignKey(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Seed Data ─────────────────────────────────────────────────────────
        SeedData(mb);
    }

    private static void SeedData(ModelBuilder mb)
    {
        // Admin user (password: Admin@123)
        mb.Entity<User>().HasData(new User
        {
            Id = 1,
            Name = "Admin",
            Email = "admin@adidas.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "admin",
            CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            IsEmailVerified = true,
            IsPhoneVerified = true
        });

        // Sample products
        mb.Entity<Product>().HasData(
            new Product
            {
                Id = 1,
                Name = "Adidas Classic T-Shirt",
                Description = "Premium cotton blend t-shirt with iconic 3-stripe design. Comfortable fit for everyday wear.",
                Price = 550,
                OriginalPrice = 750,
                Category = "T-Shirts",
                Brand = "adidas",
                Images = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
                Sizes = "S|M|L|XL|XXL",
                Colors = "White|Black|Navy",
                Tags = "casual|cotton|classic",
                Stock = 100,
                Rating = 4.5m,
                ReviewCount = 12,
                IsNew = true,
                IsFeatured = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 2,
                Name = "Adidas Running Shorts",
                Description = "Lightweight running shorts with moisture-wicking technology for peak performance.",
                Price = 850,
                OriginalPrice = 1100,
                Category = "Shorts",
                Brand = "adidas",
                Images = "https://images.unsplash.com/photo-1562886812-a775d973cf59?w=600",
                Sizes = "S|M|L|XL",
                Colors = "Black|Grey|Blue",
                Tags = "running|sport|performance",
                Stock = 60,
                Rating = 4.3m,
                ReviewCount = 8,
                IsNew = true,
                IsFeatured = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 3,
                Name = "Adidas Hoodie Pro",
                Description = "Warm fleece hoodie perfect for training sessions and casual outings.",
                Price = 1800,
                OriginalPrice = 2400,
                Category = "Hoodies",
                Brand = "adidas",
                Images = "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600",
                Sizes = "S|M|L|XL|XXL",
                Colors = "Black|Grey|Olive",
                Tags = "hoodie|fleece|warm",
                Stock = 45,
                Rating = 4.7m,
                ReviewCount = 21,
                IsNew = false,
                IsFeatured = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 4,
                Name = "Adidas Track Jacket",
                Description = "Iconic track jacket with zip-up front and contrasting stripe detail.",
                Price = 2200,
                OriginalPrice = 2800,
                Category = "Jackets",
                Brand = "adidas",
                Images = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
                Sizes = "S|M|L|XL",
                Colors = "Navy|Black|Red",
                Tags = "track|jacket|sport",
                Stock = 30,
                Rating = 4.6m,
                ReviewCount = 15,
                IsNew = true,
                IsFeatured = false,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 5,
                Name = "Adidas Sport Cap",
                Description = "Adjustable snapback cap with embroidered logo. One size fits most.",
                Price = 450,
                OriginalPrice = 600,
                Category = "Accessories",
                Brand = "adidas",
                Images = "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600",
                Sizes = "OneSize",
                Colors = "Black|White|Grey",
                Tags = "cap|accessory|casual",
                Stock = 80,
                Rating = 4.2m,
                ReviewCount = 6,
                IsNew = false,
                IsFeatured = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Product
            {
                Id = 6,
                Name = "Adidas Training Pants",
                Description = "Comfortable training pants with tapered fit and elastic waistband.",
                Price = 1200,
                OriginalPrice = 1600,
                Category = "Pants",
                Brand = "adidas",
                Images = "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600",
                Sizes = "S|M|L|XL|XXL",
                Colors = "Black|Navy|Charcoal",
                Tags = "training|pants|sport",
                Stock = 50,
                Rating = 4.4m,
                ReviewCount = 9,
                IsNew = true,
                IsFeatured = true,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}