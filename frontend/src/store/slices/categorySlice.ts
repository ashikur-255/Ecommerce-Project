// store/slices/categorySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Category, CategoryState } from '../../types';

const initialState: CategoryState = {
  categories: [],
  category: null,
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Add your category reducers here
  },
});

export default categorySlice.reducer;