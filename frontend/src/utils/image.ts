// src/utils/image.ts

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5085/api";
const SERVER_URL = API_URL.replace("/api", "");

/**
 * Get the full URL for an image path
 * @param path - The image path from the API (e.g., "/uploads/products/image.jpg")
 * @returns The full URL or a placeholder
 */
export const getImageUrl = (path?: string | null): string => {
  // If no path, return placeholder
  if (!path) {
    return "/placeholder.jpg";
  }

  // If it's already a full URL (http/https), return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // If it's a data URL, return as is
  if (path.startsWith("data:")) {
    return path;
  }

  // Ensure the path starts with a slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

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