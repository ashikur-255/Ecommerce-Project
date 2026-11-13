// src/store/slices/wishlistSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistService, WishlistItem } from "../../services/api";
import { AxiosError } from "axios";

// ============================================================================
// STATE
// ============================================================================

export interface WishlistState {
  items: WishlistItem[];
  productIds: number[];
  count: number;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  productIds: [],
  count: 0,
  loading: false,
  initialized: false,
  error: null,
};

// ============================================================================
// FETCH WISHLIST
// ============================================================================

export const fetchWishlist = createAsyncThunk<WishlistItem[], void, { rejectValue: string }>(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist();
      return response.data || [];
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message ?? "Failed to load wishlist.");
    }
  }
);
// ============================================================================
// FETCH WISHLIST COUNT
// ============================================================================

export const fetchWishlistCount = createAsyncThunk<number, void, { rejectValue: string }>(
  "wishlist/fetchWishlistCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getCount();
      return response.data.count ?? 0;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message ?? "Failed to load wishlist count.");
    }
  }
);

// ============================================================================
// CHECK PRODUCT IN WISHLIST
// ============================================================================

export const checkWishlist = createAsyncThunk<boolean, number, { rejectValue: string }>(
  "wishlist/checkWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.check(productId);
      return response.data.isInWishlist ?? false;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message ?? "Failed to check wishlist.");
    }
  }
);

// ============================================================================
// ADD TO WISHLIST (optimistic)
// ============================================================================

export const addToWishlist = createAsyncThunk<{ productId: number }, number, { rejectValue: string }>(
  "wishlist/addToWishlist",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await wishlistService.add(productId);
      dispatch(fetchWishlist());
      return { productId };
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message ?? "Failed to add to wishlist.");
    }
  }
);

// ============================================================================
// REMOVE FROM WISHLIST (optimistic)
// ============================================================================

export const removeFromWishlist = createAsyncThunk<{ productId: number }, number, { rejectValue: string }>(
  "wishlist/removeFromWishlist",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await wishlistService.remove(productId);
      dispatch(fetchWishlist());
      return { productId };
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message ?? "Failed to remove from wishlist.");
    }
  }
);

// ============================================================================
// CLEAR WISHLIST
// ============================================================================

export const clearWishlist = createAsyncThunk<void, void, { rejectValue: string }>(
  "wishlist/clearWishlist",
  async (_, { rejectWithValue }) => {
    try {
      await wishlistService.clear();
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message ?? "Failed to clear wishlist.");
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
    resetWishlist: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.items = action.payload;
        state.productIds = action.payload.map((i) => i.productId);
        state.count = action.payload.length;
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload ?? "Failed to load wishlist.";
      })

      .addCase(fetchWishlistCount.fulfilled, (state, action) => {
        state.count = action.payload;
      })
      .addCase(fetchWishlistCount.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to load wishlist count.";
      })

      .addCase(addToWishlist.pending, (state, action) => {
        const productId = action.meta.arg;
        if (!state.productIds.includes(productId)) {
          state.productIds.push(productId);
          state.count += 1;
        }
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, () => {})
      .addCase(addToWishlist.rejected, (state, action) => {
        const productId = action.meta.arg;
        state.productIds = state.productIds.filter((id) => id !== productId);
        state.count = Math.max(0, state.count - 1);
        state.error = action.payload ?? "Failed to add to wishlist.";
      })

      .addCase(removeFromWishlist.pending, (state, action) => {
        const productId = action.meta.arg;
        state.productIds = state.productIds.filter((id) => id !== productId);
        state.items = state.items.filter((item) => item.productId !== productId);
        state.count = Math.max(0, state.count - 1);
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, () => {})
      .addCase(removeFromWishlist.rejected, (state, action) => {
        const productId = action.meta.arg;
        if (!state.productIds.includes(productId)) {
          state.productIds.push(productId);
          state.count += 1;
        }
        state.error = action.payload ?? "Failed to remove from wishlist.";
      })

      .addCase(clearWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.productIds = [];
        state.count = 0;
        state.error = null;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to clear wishlist.";
      });
  },
});

export const { clearWishlistError, resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;