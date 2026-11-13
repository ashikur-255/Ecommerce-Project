using AutoMapper;
using EcommerceAPI.DTOs;
using EcommerceAPI.Models;

namespace EcommerceAPI.Services;

/// <summary>
/// AutoMapper profile.  Registered in Program.cs via builder.Services.AddAutoMapper().
/// All controllers in this project now use manual mapping helpers instead of IMapper
/// injection — this profile exists as a safety net if AutoMapper is used elsewhere.
/// </summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── User ──────────────────────────────────────────────────────────────
        CreateMap<User, UserDto>();

        // ── Product ───────────────────────────────────────────────────────────
        // The Product model stores pipe-delimited strings (e.g. "S|M|L").
        // We split them back to List<string> here.
        CreateMap<Product, ProductResponseDto>()
            .ForMember(d => d.Images, o => o.MapFrom(s => Split(s.Images)))
            .ForMember(d => d.Sizes, o => o.MapFrom(s => Split(s.Sizes)))
            .ForMember(d => d.Colors, o => o.MapFrom(s => Split(s.Colors)))
            .ForMember(d => d.Tags, o => o.MapFrom(s => Split(s.Tags)));

        // ── CartItem ──────────────────────────────────────────────────────────
        CreateMap<CartItem, CartItemResponseDto>()
            .ForMember(d => d.Product, o => o.MapFrom(s => s.Product));

        // ── Order ─────────────────────────────────────────────────────────────
        CreateMap<Order, OrderResponseDto>()
            .ForMember(d => d.ShippingAddress, o => o.MapFrom(s => new ShippingAddressDto
            {
                FullName = s.ShipFullName,
                Address = s.ShipAddress,
                City = s.ShipCity,
                PostalCode = s.ShipPostalCode,
                Country = s.ShipCountry,
                Phone = s.ShipPhone
            }));

        // ── OrderItem ─────────────────────────────────────────────────────────
        CreateMap<OrderItem, OrderItemResponseDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.ProductName))
            .ForMember(d => d.ProductImage, o => o.MapFrom(s => s.ProductImage));

        // ── Review ────────────────────────────────────────────────────────────
        CreateMap<Review, ReviewResponseDto>()
            .ForMember(d => d.UserName, o => o.MapFrom(s => s.User != null ? s.User.Name : string.Empty));
    }

    // Helper: safely split pipe-separated string → List<string>
    private static List<string> Split(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? new List<string>()
            : value.Split('|', StringSplitOptions.RemoveEmptyEntries).ToList();
}