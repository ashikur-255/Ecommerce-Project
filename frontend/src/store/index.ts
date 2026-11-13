// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import categoryReducer from './slices/categorySlice.ts'; // Fixed: was importing from wishlistSlice
import wishlistReducer from './slices/wishlistSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    categories: categoryReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['wishlist/toggleWishlist/fulfilled'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production', // Fixed: using import.meta.env instead of process.env
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;