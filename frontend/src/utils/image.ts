// src/utils/image.ts
import type React from "react";

const rawApiUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5085/api" : "https://ecommerce-backend-api-j6z4.onrender.com/api")
)
  .trim()
  .replace(/\/+$/, "");
const SERVER_URL = rawApiUrl.replace(/\/api$/, "");

/**
 * Fallback product image based on category or product name with index-aware variation.
 * Guarantees that multiple images for the same product or across products show distinct photos.
 */
export const getFallbackProductImage = (
  category?: string,
  name?: string,
  index: number = 0
): string => {
  const text = `${category || ""} ${name || ""}`.toLowerCase();
  const safeIndex = Math.abs(index || 0);

  if (text.includes("sport") || text.includes("jersey")) {
    const list = [
      "/products/jersey1.png",
      "/products/jersey2.png",
      "/products/jersey4.png",
      "/products/jersey5.png",
      "/products/Jersey6.png",
      "/products/shorts.jpg",
      "/products/jersey.jpg",
    ];
    return list[safeIndex % list.length];
  }

  if (text.includes("pant") || text.includes("trouser") || text.includes("bottom")) {
    const list = [
      "/products/Pant.jpg",
      "/products/pant.png",
      "/products/pant1.png",
      "/products/pnt2.png",
      "/products/pant3.png",
    ];
    return list[safeIndex % list.length];
  }

  if (text.includes("hoodie")) {
    const list = [
      "/products/Hoodie.png",
      "/products/winter.png",
      "/products/winter1.png",
    ];
    return list[safeIndex % list.length];
  }

  if (text.includes("jacket")) {
    const list = [
      "/products/Jacket.jpg",
      "/products/winter2.png",
      "/products/winter3.png",
    ];
    return list[safeIndex % list.length];
  }

  if (text.includes("short")) {
    return "/products/shorts.jpg";
  }

  if (text.includes("cap") || text.includes("hat")) {
    const list = [
      "/products/cap.png",
      "/products/cap1.jpg",
      "/products/Cap2.jpg",
      "/products/cap3.jpg",
    ];
    return list[safeIndex % list.length];
  }

  if (text.includes("shoe") || text.includes("sneaker") || text.includes("footwear")) {
    const list = [
      "/products/shoes.jpg",
      "/products/shoes1.jpg",
      "/products/shoes2.png",
    ];
    return list[safeIndex % list.length];
  }

  if (text.includes("bag")) {
    const list = ["/products/Bag.jpg", "/products/Bag1.png"];
    return list[safeIndex % list.length];
  }

  if (text.includes("shirt") || text.includes("tee") || text.includes("polo")) {
    const list = [
      "/products/tshart1.png",
      "/products/tShart2.png",
      "/products/tShart3.png",
      "/products/TShart.png",
    ];
    return list[safeIndex % list.length];
  }

  if (text.includes("glove")) {
    const list = ["/products/Gloves.jpg", "/products/Gloves1.png"];
    return list[safeIndex % list.length];
  }

  if (text.includes("winter")) {
    const list = [
      "/products/winter.png",
      "/products/winter1.png",
      "/products/winter2.png",
      "/products/winter3.png",
    ];
    return list[safeIndex % list.length];
  }

  if (text.includes("long")) {
    const list = ["/products/long.png", "/products/long1.png", "/products/long2.png"];
    return list[safeIndex % list.length];
  }

  return "/placeholder.jpg";
};

/**
 * Fallback category image based on category name.
 * Specifically maps Pants/Trousers to /categories/Pants.jpg so it never displays a t-shirt!
 */
export const getFallbackCategoryImage = (name?: string): string => {
  const text = (name || "").toLowerCase();
  if (text.includes("pant") || text.includes("trouser") || text.includes("bottom")) return "/categories/Pants.jpg";
  if (text.includes("sport") || text.includes("jersey")) return "/categories/Sports.png";
  if (text.includes("access") || text.includes("cap") || text.includes("bag")) return "/categories/Accessories.jpg";
  if (text.includes("hood")) return "/categories/Hoodies.jpg";
  if (text.includes("jack")) return "/categories/Jackets.jpg";
  if (text.includes("shoe") || text.includes("sneaker")) return "/categories/Shoes.jpg";
  if (text.includes("shirt") || text.includes("tee") || text.includes("polo")) return "/categories/T-Shirts.jpg";
  if (text.includes("cloth") || text.includes("apparel")) return "/categories/Cloth.jpg";
  return "/categories/Cloth.jpg";
};

/**
 * Robust image error handler for product images:
 * Immediately falls back to matching category/name product image with index awareness.
 * Eliminates redundant failed attempts on /uploads/.
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  category?: string,
  name?: string,
  index: number = 0
) => {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = getFallbackProductImage(category, name, index);
};

/**
 * Robust image error handler for category images
 */
export const handleCategoryImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  categoryName?: string
) => {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = getFallbackCategoryImage(categoryName);
};

/**
 * Get the full URL for an image path
 * @param path - The image path from the API (e.g., "/uploads/products/image.jpg")
 * @returns The full URL or a placeholder
 */
export const getImageUrl = (path?: string | null): string => {
  // If no path, return placeholder
  if (!path || !path.trim()) {
    return "/placeholder.jpg";
  }

  const trimmed = path.trim();

  // If it's already a full URL (http/https), return as is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If it's a data URL, return as is
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  // If it's already a local static public asset, return as is
  if (
    trimmed.startsWith("/products/") ||
    trimmed.startsWith("/categories/") ||
    trimmed.startsWith("/reviews/") ||
    trimmed.startsWith("/placeholder") ||
    trimmed.startsWith("/default-avatar") ||
    trimmed.startsWith("/BDF") ||
    trimmed.startsWith("/Logo")
  ) {
    return trimmed;
  }

  // Ensure the path starts with a slash
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // Return the full URL
  return `${SERVER_URL}${cleanPath}`;
};

/**
 * Get the full URL for a category image with smart category fallback.
 * Automatically maps to pristine CDN category images if path is empty or an ephemeral /uploads/ path.
 */
export const getCategoryImageUrl = (path?: string | null, categoryName?: string): string => {
  if (!path || !path.trim() || path.includes("/uploads/categories/")) {
    return getFallbackCategoryImage(categoryName);
  }
  return getImageUrl(path);
};

/**
 * Get the full URL for a product image with category fallback and index awareness.
 * Automatically maps to crisp CDN product assets if path is empty or an ephemeral /uploads/ path.
 */
export const getProductImageUrl = (
  path?: string | null,
  category?: string,
  name?: string,
  index: number = 0
): string => {
  if (!path || !path.trim()) {
    return getFallbackProductImage(category, name, index);
  }

  const trimmed = path.trim();

  // If already full remote URL (e.g. Unsplash, Cloudinary, AWS S3)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // If already a local static public asset
  if (trimmed.startsWith("/products/") || trimmed.startsWith("/categories/")) {
    return trimmed;
  }

  // If it's an ephemeral /uploads/ path, immediately serve local CDN asset without waiting for Render
  if (trimmed.startsWith("/uploads/products/")) {
    return getFallbackProductImage(category, name, index);
  }

  return getImageUrl(trimmed);
};

/**
 * Get the full URL for a user avatar
 */
export const getAvatarUrl = (path?: string | null): string => {
  if (!path) return "/default-avatar.png";
  return getImageUrl(path);
};
