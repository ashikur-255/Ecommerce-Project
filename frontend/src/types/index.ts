// ═══════════════════════════════════════════════════════════════════════════
//  USER / AUTH  — matches UserDto / AuthResponseDto
// ═══════════════════════════════════════════════════════════════════════════

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: "customer" | "admin";
  avatar?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt?: string;
}

export interface AuthResponse {
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

// ═══════════════════════════════════════════════════════════════════════════
//  PRODUCT  — matches ProductResponseDto
// ═══════════════════════════════════════════════════════════════════════════

export interface WishlistState {
  items: Product[];
  isLoading: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  error: string | null;
  totalItems: number;
}

export interface RootState {
  auth: AuthState;
  products: ProductState;
  cart: CartState;
  orders: OrderState;
  categories: CategoryState;
  wishlist: WishlistState;
}

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

// ═══════════════════════════════════════════════════════════════════════════
//  CATEGORY  — matches CategoryResponseDto
// ═══════════════════════════════════════════════════════════════════════════

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
  createdAt: string;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  totalPages: number;
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

// ═══════════════════════════════════════════════════════════════════════════
//  CART  — matches CartItemResponseDto / CartResponseDto
// ═══════════════════════════════════════════════════════════════════════════

export interface CartItem {
  productId: number;
  quantity: number;
  size: string;
  color: string;
  product: Product;
}

export interface Cart {
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

// ═══════════════════════════════════════════════════════════════════════════
//  ORDER  — matches OrderResponseDto / OrderItemResponseDto
// ═══════════════════════════════════════════════════════════════════════════

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
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

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: number;
  userId: number;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  subTotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentIntentId: string;
  paymentMethod: "Stripe" | "CashOnDelivery" | "Bkash" | "Nagad" | "Rocket";
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  consignmentId?: string | null;
  trackingCode?: string | null;
  deliveryStatus?: string | null;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateOrderData {
  orderItems: {
    productId: number;
    quantity: number;
    size: string;
    color: string;
  }[];
  shippingAddress: ShippingAddress;
  paymentIntentId?: string | null;
  paymentMethod?: "Stripe" | "CashOnDelivery" | "Bkash" | "Nagad" | "Rocket";
}

// ═══════════════════════════════════════════════════════════════════════════
//  REVIEW  — matches ReviewResponseDto
// ═══════════════════════════════════════════════════════════════════════════

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductDetailResponse {
  product: Product;
  reviews: Review[];
}

export interface CreateReviewData {
  productId: number;
  rating: number;
  comment: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//  PAYMENT
// ═══════════════════════════════════════════════════════════════════════════

/** Matches the admin payment record returned by GET /api/payments */
export interface Payment {
  id: number;
  orderId?: number | null;
  amount: number;
  currency: string;
  status: string;
  provider: "Stripe" | "Bkash" | "Nagad" | "Rocket" | "CashOnDelivery" | "SslCommerz";
  providerReference?: string | null;
  providerTransactionId?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

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

// ═══════════════════════════════════════════════════════════════════════════
//  SSLCOMMERZ
// ═══════════════════════════════════════════════════════════════════════════

export interface SSLCommerzCreatePaymentData {
  orderItems: {
    productId: number;
    quantity: number;
    size: string;
    color: string;
  }[];
  shippingAddress: ShippingAddress;
}

export interface SSLCommerzCreateResponse {
  orderId: number;
  transactionId: string;
  gatewayPageUrl: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//  NEWSLETTER
// ═══════════════════════════════════════════════════════════════════════════

export interface NewsletterSubscription {
  id: number;
  email: string;
  isActive: boolean;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//  API RESPONSE WRAPPER  — matches ApiResponse<T>
// ═══════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ═══════════════════════════════════════════════════════════════════════════
//  REDUX STATE SHAPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProductState {
  products: Product[];
  product: Product | null;
  newArrivals: Product[];
  featured: Product[];
  categories: string[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  error: string | null;
}

export interface OrderState {
  orders: Order[];
  order: Order | null;
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

export interface CategoryState {
  categories: Category[];
  category: Category | null;
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
//  UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}