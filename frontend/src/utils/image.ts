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
 * Fallback product image based on category or product name
 */
export const getFallbackProductImage = (category?: string, name?: string): string => {
  const text = `${category || ""} ${name || ""}`.toLowerCase();
  if (text.includes("hoodie")) return "/products/Hoodie.png";
  if (text.includes("jacket")) return "/products/Jacket.jpg";
  if (text.includes("pant") || text.includes("trouser")) return "/products/Pant.jpg";
  if (text.includes("short")) return "/products/shorts.jpg";
  if (text.includes("cap") || text.includes("hat")) return "/products/cap.png";
  if (text.includes("shoe") || text.includes("sneaker")) return "/products/shoes.jpg";
  if (text.includes("bag")) return "/products/Bag.jpg";
  if (text.includes("shirt") || text.includes("tee")) return "/products/tshart1.png";
  if (text.includes("glove")) return "/products/Gloves.jpg";
  return "/placeholder.jpg";
};

/**
 * Fallback category image based on category name
 */
export const getFallbackCategoryImage = (name?: string): string => {
  const text = (name || "").toLowerCase();
  if (text.includes("access")) return "/categories/Accessories.jpg";
  if (text.includes("hood")) return "/categories/Hoodies.jpg";
  if (text.includes("jack")) return "/categories/Jackets.jpg";
  if (text.includes("shoe")) return "/categories/Shoes.jpg";
  if (text.includes("sport")) return "/categories/Sports.png";
  if (text.includes("shirt") || text.includes("tee")) return "/categories/T-Shirts.jpg";
  if (text.includes("cloth")) return "/categories/Cloth.jpg";
  return "/placeholder.jpg";
};

/**
 * Robust image error handler for product images:
 * 1. If backend /uploads/... 404s, tries the local frontend /uploads/... static asset
 * 2. If that fails or not applicable, falls back to matching category/name product image
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  category?: string,
  name?: string
) => {
  const target = e.currentTarget;
  const currentSrc = target.src || "";

  // 1. If failed on remote /uploads/..., try local frontend static /uploads/...
  if (currentSrc.includes("/uploads/") && !target.dataset.triedLocalUpload) {
    target.dataset.triedLocalUpload = "true";
    const uploadIndex = currentSrc.indexOf("/uploads/");
    target.src = currentSrc.substring(uploadIndex);
    return;
  }

  // 2. Fall back to smart category/name image or placeholder
  target.onerror = null;
  target.src = getFallbackProductImage(category, name);
};

/**
 * Robust image error handler for category images
 */
export const handleCategoryImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  categoryName?: string
) => {
  const target = e.currentTarget;
  const currentSrc = target.src || "";

  if (currentSrc.includes("/uploads/") && !target.dataset.triedLocalUpload) {
    target.dataset.triedLocalUpload = "true";
    const uploadIndex = currentSrc.indexOf("/uploads/");
    target.src = currentSrc.substring(uploadIndex);
    return;
  }

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
 * Get the full URL for a category image
 */
export const getCategoryImageUrl = (path?: string | null): string => {
  return getImageUrl(path);
};

/**
 * Get the full URL for a product image
 */
export const getProductImageUrl = (path?: string | null): string => {
  return getImageUrl(path);
};

/**
 * Get the full URL for a user avatar
 */
export const getAvatarUrl = (path?: string | null): string => {
  if (!path) return "/default-avatar.png";
  return getImageUrl(path);
};
