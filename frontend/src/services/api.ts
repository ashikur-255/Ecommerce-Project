// services/api/index.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import type { Payment } from "../types";
// ─── Type Definitions ──────────────────────────────────────────────────────

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth Types
export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: "admin" | "customer";
  avatar?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt?: string;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface ForgotPasswordData {
  email?: string;
  phone?: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface VerifyPhoneData {
  code: string;
}

export interface ResendVerificationData {
  email?: string;
  phone?: string;
  type: "email" | "phone";
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  imageFiles: File[];
  sizes: string[];
  colors: string[];
  tags: string[];
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
}

// Cart Types
export interface CartItem {
  productId: number;
  quantity: number;
  size: string;
  color: string;
  product: Product;
}

export interface CartResponse {
  items: CartItem[];
  itemCount: number;
  total: number;
}

export interface AddToCartData {
  productId: number;
  quantity: number;
  size: string;
  color: string;
}

// Order Types
export interface OrderItem {
  productId: number;
  quantity: number;
  size: string;
  color: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CreateOrderData {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentIntentId?: string | null;
  paymentMethod?: "Stripe" | "CashOnDelivery" | "Bkash" | "Nagad" | "Rocket";
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface OrderResponse {
  id: number;
  userId: number;
  orderItems: OrderItemResponse[];
  shippingAddress: ShippingAddress;
  subTotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  paymentIntentId: string;
  createdAt: string;
  updatedAt: string;
  consignmentId?: string;
  trackingCode?: string;
  deliveryStatus?: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
  createdAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  imageFile?: File | null;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateCategoryData {
  name: string;
  description?: string;
  imageFile?: File | null;
  isActive: boolean;
  displayOrder: number;
  removeImage?: boolean;
}

// Review Types
export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewData {
  productId: number;
  rating: number;
  comment: string;
}

// Payment Types
export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
}

export interface CreateBkashPaymentData {
  amount: number;
  currency?: string;
}

export interface BkashPaymentResponse {
  provider: string;
  paymentId: string;
  redirectUrl: string;
}

// Newsletter Types
export interface NewsletterSubscribeData {
  email: string;
}

// SSLCommerz Types
export interface SSLCommerzCreatePaymentData {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
}

export interface SSLCommerzCreateResponse {
  orderId: number;
  transactionId: string;
  gatewayPageUrl: string;
}

// Steadfast Types
export interface SteadfastCreateOrderData {
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
}

export interface SteadfastConsignment {
  consignmentId: number;
  invoice: string;
  trackingCode: string;
  status: string;
}

export interface SteadfastCreateOrderResponse {
  status: number;
  message?: string;
  consignment?: SteadfastConsignment;
}

// ─── API Client ──────────────────────────────────────────────────────────

const rawApiUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5085/api" : "https://ecommerce-backend-api-j6z4.onrender.com/api")
)
  .trim()
  .replace(/\/+$/, "");

const BASE_URL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 65000, // 65s timeout to handle Render free-tier cold starts
});

// ─── Request Interceptor ──────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirect to login if not already there
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/login") && 
          !currentPath.startsWith("/verify-") &&
          !currentPath.startsWith("/reset-password") &&
          !currentPath.startsWith("/forgot-password")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Wishlist Service ───────────────────────────────────────────────


// src/services/api.ts - Fix the check endpoint

export const wishlistService = {
  // ✅ raw array, কোনো wrapper নেই
  getWishlist: () =>
    api.get<WishlistItem[]>("/wishlist"),

  getCount: () =>
    api.get<{ count: number }>("/wishlist/count"),

  check: (productId: number) =>
    api.get<{ isInWishlist: boolean }>(`/wishlist/check/${productId}`),

  add: (productId: number) =>
    api.post<ApiResponse<string>>(`/wishlist/${productId}`),

  remove: (productId: number) =>
    api.delete<ApiResponse<string>>(`/wishlist/${productId}`),

  clear: () =>
    api.delete<ApiResponse<string>>("/wishlist/clear"),
};


// ══════════════════════════════════════════════════════════════════════════
//  AUTH SERVICE
// ══════════════════════════════════════════════════════════════════════════
export const authService = {
  register: (data: RegisterData): Promise<AxiosResponse<ApiResponse<AuthData>>> =>
    api.post("/auth/register", data),

  login: (data: LoginCredentials): Promise<AxiosResponse<ApiResponse<AuthData>>> =>
    api.post("/auth/login", data),

  forgotPassword: (data: ForgotPasswordData): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordData): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post("/auth/reset-password", data),

  verifyEmail: (data: VerifyEmailData): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post("/auth/verify-email", data),

  verifyPhone: (data: VerifyPhoneData): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post("/auth/verify-phone", data),

  resendVerification: (data: ResendVerificationData): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post("/auth/resend-verification", data),

  getMe: (): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.get("/auth/me"),

  updateProfile: (data: FormData): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.put("/auth/profile", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getAllUsers: (params?: { page?: number; limit?: number; search?: string }): 
    Promise<AxiosResponse<ApiResponse<{ users: User[]; total: number; page: number; totalPages: number }>>> =>
    api.get("/auth/users", { params }),

  deleteUser: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/auth/users/${id}`),
};

// ══════════════════════════════════════════════════════════════════════════
//  PRODUCT SERVICE
// ══════════════════════════════════════════════════════════════════════════
export const productService = {
  getAll: (params?: ProductQuery): Promise<AxiosResponse<ApiResponse<ProductListResponse>>> =>
    api.get("/products", { params }),

  getById: (id: number): Promise<AxiosResponse<ApiResponse<{ product: Product }>>> =>
    api.get(`/products/${id}`),

  getNewArrivals: (): Promise<AxiosResponse<ApiResponse<Product[]>>> =>
    api.get("/products/new-arrivals"),

  getFeatured: (): Promise<AxiosResponse<ApiResponse<Product[]>>> =>
    api.get("/products/featured"),

  getCategories: (): Promise<AxiosResponse<ApiResponse<string[]>>> =>
    api.get("/products/categories"),
  getBrands: (): Promise<AxiosResponse<ApiResponse<string[]>>> =>
  api.get("/products/brands"),

  create: (data: CreateProductData): Promise<AxiosResponse<ApiResponse<Product>>> => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("originalPrice", data.originalPrice.toString());
    formData.append("category", data.category);
    formData.append("brand", data.brand);
    formData.append("stock", data.stock.toString());
    formData.append("isNew", data.isNew.toString());
    formData.append("isFeatured", data.isFeatured.toString());
    
    data.sizes.forEach((size) => formData.append("sizes", size));
    data.colors.forEach((color) => formData.append("colors", color));
    data.tags.forEach((tag) => formData.append("tags", tag));
    data.imageFiles.forEach((file) => formData.append("Images", file));

    return api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, data: CreateProductData): Promise<AxiosResponse<ApiResponse<Product>>> => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("originalPrice", data.originalPrice.toString());
    formData.append("category", data.category);
    formData.append("brand", data.brand);
    formData.append("stock", data.stock.toString());
    formData.append("isNew", data.isNew.toString());
    formData.append("isFeatured", data.isFeatured.toString());
    
    data.sizes.forEach((size) => formData.append("sizes", size));
    data.colors.forEach((color) => formData.append("colors", color));
    data.tags.forEach((tag) => formData.append("tags", tag));
    data.imageFiles.forEach((file) => formData.append("Images", file));

    return api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateStock: (id: number, stock: number): Promise<AxiosResponse<ApiResponse<Product>>> =>
    api.patch(`/products/${id}/stock`, { stock }),

  delete: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/products/${id}`),
};

// ══════════════════════════════════════════════════════════════════════════
//  CART SERVICE
// ══════════════════════════════════════════════════════════════════════════
export const cartService = {
  getCart: (): Promise<AxiosResponse<ApiResponse<CartResponse>>> =>
    api.get("/cart"),
  
  getCount: (): Promise<AxiosResponse<ApiResponse<{ count: number }>>> =>
    api.get("/cart/count"),

  addToCart: (data: AddToCartData): Promise<AxiosResponse<ApiResponse<CartResponse>>> =>
    api.post("/cart/add", data),

  updateCart: (data: AddToCartData): Promise<AxiosResponse<ApiResponse<CartResponse>>> =>
    api.put("/cart/update", data),

  removeFromCart: (productId: number, size = "", color = ""): Promise<AxiosResponse<ApiResponse<CartResponse>>> =>
    api.delete(`/cart/remove/${productId}`, { params: { size, color } }),

  clearCart: (): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete("/cart/clear"),
};

// ══════════════════════════════════════════════════════════════════════════
// WISHLIST TYPES
// ══════════════════════════════════════════════════════════════════════════

export interface WishlistItem {
  productId: number;
  productName: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  brand: string;
  isNew: boolean;
  isFeatured: boolean;
  addedAt: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
// ══════════════════════════════════════════════════════════════════════════
//  ORDER SERVICE
// ══════════════════════════════════════════════════════════════════════════
export const orderService = {
  create: (data: CreateOrderData): Promise<AxiosResponse<ApiResponse<OrderResponse>>> =>
    api.post("/orders", data),

  getMyOrders: (params?: { page?: number; limit?: number }): 
    Promise<AxiosResponse<ApiResponse<{ orders: OrderResponse[]; total: number; page: number; totalPages: number }>>> =>
    api.get("/orders/my", { params }),

  getById: (id: number): Promise<AxiosResponse<ApiResponse<OrderResponse>>> =>
    api.get(`/orders/${id}`),

  getAll: (params?: { page?: number; limit?: number; status?: string }): 
    Promise<AxiosResponse<ApiResponse<{ orders: OrderResponse[]; total: number; page: number; totalPages: number }>>> =>
    api.get("/orders", { params }),

  updateStatus: (id: number, status: string): Promise<AxiosResponse<ApiResponse<OrderResponse>>> =>
    api.put(`/orders/${id}/status`, { status }),

  updatePaymentStatus: (id: number, paymentStatus: string): Promise<AxiosResponse<ApiResponse<OrderResponse>>> =>
    api.put(`/orders/${id}/payment`, { paymentStatus }),

  deleteOrder: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/orders/${id}`),

  cancelOrder: (id: number): Promise<AxiosResponse<ApiResponse<OrderResponse>>> =>
    api.put(`/orders/${id}/cancel`),

  deleteMyOrder: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/orders/${id}/my`),
};

// ══════════════════════════════════════════════════════════════════════════
//  REVIEW SERVICE
// ══════════════════════════════════════════════════════════════════════════
export const reviewService = {
  getByProduct: (productId: number, page = 1, limit = 10): 
    Promise<AxiosResponse<ApiResponse<{ reviews: Review[]; total: number; page: number; totalPages: number }>>> =>
    api.get(`/reviews/${productId}`, { params: { page, limit } }),

  create: (data: CreateReviewData): Promise<AxiosResponse<ApiResponse<Review>>> =>
    api.post("/reviews", data),

  delete: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/reviews/${id}`),
};

// ══════════════════════════════════════════════════════════════════════════
//  CATEGORY SERVICE
// ══════════════════════════════════════════════════════════════════════════
export const categoryService = {
  getAll: (includeInactive = false): Promise<AxiosResponse<ApiResponse<Category[]>>> =>
    api.get("/categories", { params: { includeInactive } }),

  getById: (id: number): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.get(`/categories/${id}`),

  create: (payload: CreateCategoryData): Promise<AxiosResponse<ApiResponse<Category>>> => {
    const formData = new FormData();
    formData.append("Name", payload.name);
    if (payload.description) formData.append("Description", payload.description);
    formData.append("IsActive", String(payload.isActive));
    formData.append("DisplayOrder", String(payload.displayOrder));
    if (payload.imageFile) formData.append("Image", payload.imageFile);

    return api.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, payload: UpdateCategoryData): Promise<AxiosResponse<ApiResponse<Category>>> => {
    const formData = new FormData();
    formData.append("Name", payload.name);
    if (payload.description) formData.append("Description", payload.description);
    formData.append("IsActive", String(payload.isActive));
    formData.append("DisplayOrder", String(payload.displayOrder));
    formData.append("RemoveImage", String(!!payload.removeImage));
    if (payload.imageFile) formData.append("Image", payload.imageFile);

    return api.put(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id: number): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/categories/${id}`),
};

// ══════════════════════════════════════════════════════════════════════════
//  NEWSLETTER SERVICE
// ══════════════════════════════════════════════════════════════════════════
export const newsletterService = {
  subscribe: (email: string): Promise<AxiosResponse<ApiResponse<{ email: string; subscribedAt: string }>>> =>
    api.post("/newsletter/subscribe", { email }),
  
  getAll: (): Promise<AxiosResponse<ApiResponse<{ email: string; subscribedAt: string }[]>>> =>
    api.get("/newsletter"),
};

// ══════════════════════════════════════════════════════════════════════════
//  PAYMENT SERVICE
// ══════════════════════════════════════════════════════════════════════════
export const paymentService = {
  createIntent: (data: CreatePaymentIntentData): Promise<AxiosResponse<ApiResponse<PaymentIntentResponse>>> =>
    api.post("/payments/create-intent", data),

  createBkashPayment: (data: CreateBkashPaymentData): Promise<AxiosResponse<ApiResponse<BkashPaymentResponse>>> =>
    api.post("/bkash/create-payment", {
      amount: data.amount,
      currency: data.currency ?? "BDT",
    }),

  getBkashStatus: (paymentId: string): Promise<AxiosResponse<ApiResponse<{ status: string; paymentId: string }>>> =>
    api.get(`/bkash/status/${paymentId}`),
};

export const adminPaymentService = {
  getAll: (params?: { page?: number; limit?: number; provider?: string; status?: string }): 
    Promise<AxiosResponse<ApiResponse<{ payments: Payment[]; total: number; page: number; totalPages: number }>>> =>
    api.get("/payments", { params }),

  getById: (id: number): Promise<AxiosResponse<ApiResponse<Payment>>> =>
    api.get(`/payments/${id}`),
};

// ══════════════════════════════════════════════════════════════════════════
//  SSLCOMMERZ SERVICE
// ══════════════════════════════════════════════════════════════════════════
export const sslcommerzService = {
  createPayment: (data: SSLCommerzCreatePaymentData): Promise<AxiosResponse<ApiResponse<SSLCommerzCreateResponse>>> =>
    api.post("/sslcommerz/create-payment", data),

  getStatus: (orderId: number): Promise<AxiosResponse<ApiResponse<{ status: string; orderId: number }>>> =>
    api.get(`/sslcommerz/status/${orderId}`),
};

// ══════════════════════════════════════════════════════════════════════════
//  STEADFAST COURIER SERVICE
// ══════════════════════════════════════════════════════════════════════════
export const steadfastService = {
  createOrder: (data: SteadfastCreateOrderData): Promise<AxiosResponse<ApiResponse<SteadfastCreateOrderResponse>>> =>
    api.post("/steadfast/create-order", data),

  getOrderStatus: (consignmentId: number): Promise<AxiosResponse<ApiResponse<SteadfastConsignment>>> =>
    api.get(`/steadfast/order/${consignmentId}`),

  getTrackingInfo: (trackingCode: string): Promise<AxiosResponse<ApiResponse<{ trackingCode: string; status: string; history: unknown[] }>>> =>
    api.get(`/steadfast/tracking/${trackingCode}`),
};

// ─── Default Export ──────────────────────────────────────────────────────

export default api;