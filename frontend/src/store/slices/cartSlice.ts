import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { cartService } from "../../services/api";
import type { CartState, CartItem } from "../../types";
import toast from "react-hot-toast";

/**
 * Cart API Response
 */
interface CartPayload {
  items: CartItem[];
  itemCount: number;
  total: number;
}

const initialState: CartState = {
  items: [],
  itemCount: 0,
  total: 0,
  isLoading: false,
  error: null, // ← Add this line
};

// Fetch Cart
export const fetchCart = createAsyncThunk<CartPayload>(
  "cart/fetchCart",
  async () => {
    const res = await cartService.getCart();
    return res.data.data;
  }
);

// Add To Cart
export const addToCart = createAsyncThunk<
  CartPayload,
  {
    productId: number;
    quantity: number;
    size: string;
    color: string;
  },
  {
    rejectValue: string;
  }
>(
  "cart/addToCart",
  async (data, { rejectWithValue }) => {
    try {
      await cartService.addToCart(data);

      const res = await cartService.getCart();

      return res.data.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message ?? "Failed to add to cart."
        );
      }

      return rejectWithValue("Failed to add to cart.");
    }
  }
);

// Update Cart Item
export const updateCartItem = createAsyncThunk<
  CartPayload,
  {
    productId: number;
    quantity: number;
    size: string;
    color: string;
  },
  {
    rejectValue: string;
  }
>(
  "cart/updateItem",
  async (data, { rejectWithValue }) => {
    try {
      await cartService.updateCart(data);

      const res = await cartService.getCart();

      return res.data.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message ?? "Failed to update cart."
        );
      }

      return rejectWithValue("Failed to update cart.");
    }
  }
);

// Remove From Cart
export const removeFromCart = createAsyncThunk<
  CartPayload,
  {
    productId: number;
    size?: string;
    color?: string;
  },
  {
    rejectValue: string;
  }
>(
  "cart/removeItem",
  async (
    { productId, size = "", color = "" },
    { rejectWithValue }
  ) => {
    try {
      await cartService.removeFromCart(productId, size, color);

      const res = await cartService.getCart();

      return res.data.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message ?? "Failed to remove item."
        );
      }

      return rejectWithValue("Failed to remove item.");
    }
  }
);

// Clear Cart
export const clearCart = createAsyncThunk<CartPayload>(
  "cart/clearCart",
  async () => {
    await cartService.clearCart();

    return {
      items: [],
      itemCount: 0,
      total: 0,
    };
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.total = 0;
      state.error = null; // ← Add this line
    },
  },

  extraReducers: (builder) => {
    const setCart = (
      state: CartState,
      action: PayloadAction<CartPayload>
    ) => {
      state.isLoading = false;
      state.items = action.payload.items ?? [];
      state.itemCount = action.payload.itemCount ?? 0;
      state.total = action.payload.total ?? 0;
      state.error = null; // ← Add this line to clear error on success
    };

    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null; // ← Clear previous errors
      })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch cart"; // ← Set error
      })

      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        setCart(state, action);
        toast.success("Added to cart!");
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add to cart"; // ← Set error

        if (action.payload) {
          toast.error(action.payload);
        }
      })

      // Update Cart
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update cart"; // ← Set error

        if (action.payload) {
          toast.error(action.payload);
        }
      })

      // Remove Item
      .addCase(removeFromCart.pending, (state) => {
        state.error = null; // ← Clear previous errors
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        setCart(state, action);
        toast.success("Item removed.");
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload || "Failed to remove item"; // ← Set error
        if (action.payload) {
          toast.error(action.payload);
        }
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        setCart(state, action);
        toast.success("Cart cleared!");
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to clear cart";
        toast.error("Failed to clear cart");
      });
  },
});

export const { resetCart } = cartSlice.actions;

export default cartSlice.reducer;