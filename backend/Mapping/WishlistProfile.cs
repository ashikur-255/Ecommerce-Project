using AutoMapper;
using EcommerceAPI.DTOs.Wishlist;
using EcommerceAPI.Models;

namespace EcommerceAPI.Mapping;

public class WishlistProfile : Profile
{
    public WishlistProfile()
    {
        CreateMap<Wishlist, WishlistItemDto>()
            .ForMember(d => d.ProductId,
                o => o.MapFrom(s => s.Product.Id))

            .ForMember(d => d.ProductName,
                o => o.MapFrom(s => s.Product.Name))

            .ForMember(d => d.Price,
                o => o.MapFrom(s => s.Product.Price))

            .ForMember(d => d.OriginalPrice,
                o => o.MapFrom(s => s.Product.OriginalPrice))

            .ForMember(d => d.Brand,
                o => o.MapFrom(s => s.Product.Brand))

            .ForMember(d => d.Category,
                o => o.MapFrom(s => s.Product.Category))

            .ForMember(d => d.Image,
                o => o.MapFrom(s =>
                    s.Product.Images
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .FirstOrDefault() ?? string.Empty))

            .ForMember(d => d.Stock,
                o => o.MapFrom(s => s.Product.Stock))

            .ForMember(d => d.InStock,
                o => o.MapFrom(s => s.Product.Stock > 0))

            .ForMember(d => d.AddedAt,
                o => o.MapFrom(s => s.CreatedAt));
    }
}