import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { productService } from "../../services/api";
import type { ProductState, ProductQuery, Product, ProductListResponse } from "../../types";

// ─── Initial State ──────────────────────────────────────────────────────────
const initialState: ProductState = {
  products: [],
  product: null,
  newArrivals: [],
  featured: [],
  categories: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

// ─── Fetch all products with pagination ────────────────────────────────────
export const fetchProducts = createAsyncThunk<
  ProductListResponse,
  ProductQuery | undefined
>("products/fetchAll", async (query) => {
  const res = await productService.getAll(query);
  return res.data.data;
});

// ─── Fetch a single product by ID ─────────────────────────────────────────
export const fetchProductById = createAsyncThunk<
  Product,
  number
>("products/fetchById", async (id) => {
  const res = await productService.getById(id);
  return res.data.data.product;
});

// ─── Fetch new arrivals ────────────────────────────────────────────────────
export const fetchNewArrivals = createAsyncThunk<
  Product[],
  void
>("products/newArrivals", async () => {
  const res = await productService.getNewArrivals();
  return res.data.data ?? [];
});

// ─── Fetch featured products ──────────────────────────────────────────────
export const fetchFeatured = createAsyncThunk<
  Product[],
  void
>("products/featured", async () => {
  const res = await productService.getFeatured();
  return res.data.data ?? [];
});

// ─── Fetch categories ──────────────────────────────────────────────────────
export const fetchCategories = createAsyncThunk<
  string[],
  void
>("products/categories", async () => {
  const res = await productService.getCategories();
  return res.data.data ?? [];
});

// ─── Product Slice ─────────────────────────────────────────────────────────
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProduct: (state) => {
      state.product = null;
    },
    resetPagination: (state) => {
      state.page = 1;
      state.total = 0;
      state.totalPages = 1;
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── fetchProducts ──────────────────────────────────────────────
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<ProductListResponse>) => {
        state.isLoading = false;
        state.products = action.payload.products ?? [];
        state.total = action.payload.total ?? 0;
        state.page = action.payload.page ?? 1;
        state.totalPages = action.payload.totalPages ?? 1;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load products.";
      })

      // ─── fetchProductById ───────────────────────────────────────────
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.product = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.product = null;
        state.error = action.error.message ?? "Failed to load product.";
      })

      // ─── fetchNewArrivals ───────────────────────────────────────────
      .addCase(fetchNewArrivals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false;
        state.newArrivals = action.payload ?? [];
        state.error = null;
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.isLoading = false;
        state.newArrivals = [];
        state.error = action.error.message ?? "Failed to load new arrivals.";
      })

      // ─── fetchFeatured ──────────────────────────────────────────────
      .addCase(fetchFeatured.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeatured.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false;
        state.featured = action.payload ?? [];
        state.error = null;
      })
      .addCase(fetchFeatured.rejected, (state, action) => {
        state.isLoading = false;
        state.featured = [];
        state.error = action.error.message ?? "Failed to load featured products.";
      })

      // ─── fetchCategories ────────────────────────────────────────────
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.isLoading = false;
        state.categories = action.payload ?? [];
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.categories = [];
        state.error = action.error.message ?? "Failed to load categories.";
      });
  },
});

export const { clearProduct, resetPagination } = productSlice.actions;
export default productSlice.reducer;