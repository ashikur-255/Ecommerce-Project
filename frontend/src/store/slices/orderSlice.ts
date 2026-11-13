import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { orderService } from "../../services/api";
import type {
  Order,
  OrderState,
  OrderListResponse,
  ShippingAddress,
} from "../../types";

export interface CreateOrderRequest {
  orderItems: {
    productId: number;
    quantity: number;
    size: string;
    color: string;
  }[];

  shippingAddress: ShippingAddress;

  paymentIntentId?: string | null;

  paymentMethod?: "Stripe" | "CashOnDelivery";
}

const initialState: OrderState = {
  orders: [],
  order: null,
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

// ===============================
// Create Order
// ===============================
export const createOrder = createAsyncThunk<
  Order,
  CreateOrderRequest,
  { rejectValue: string }
>(
  "orders/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await orderService.create(data);

      return res.data.data as Order;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message ?? "Failed to place order."
        );
      }

      return rejectWithValue("Failed to place order.");
    }
  }
);

// ===============================
// Fetch My Orders
// ===============================
export const fetchMyOrders = createAsyncThunk<
  OrderListResponse,
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>(
  "orders/fetchMy",
  async (params, { rejectWithValue }) => {
    try {
      const res = await orderService.getMyOrders(params);

      return res.data.data as OrderListResponse;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message ?? "Failed to load orders."
        );
      }

      return rejectWithValue("Failed to load orders.");
    }
  }
);

// ===============================
// Fetch Order By Id
// ===============================
export const fetchOrderById = createAsyncThunk<
  Order,
  number,
  { rejectValue: string }
>(
  "orders/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await orderService.getById(id);

      return res.data.data as Order;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message ?? "Failed to load order."
        );
      }

      return rejectWithValue("Failed to load order.");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,

  reducers: {
    clearOrder: (state) => {
      state.order = null;
    },

    clearOrderError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ===============================
      // Create Order
      // ===============================
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })

      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to place order";
      })

      // ===============================
      // Fetch My Orders
      // ===============================
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })

      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to load orders";
      })

      // ===============================
      // Fetch Single Order
      // ===============================
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })

      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to load order";
      });
  },
});

export const { clearOrder, clearOrderError } = orderSlice.actions;

export default orderSlice.reducer;