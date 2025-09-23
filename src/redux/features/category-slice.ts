import { CategoryWithCount, listCategoriesWithCounts } from "@/app/actions/action";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  items: CategoryWithCount[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch categories with counts
export const fetchCategoriesWithCounts = createAsyncThunk(
  'categories/fetchCategoriesWithCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await listCategoriesWithCounts();
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch categories');
    }
  }
);

const categorieSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // You can add synchronous reducers here if needed
    setCategories(state, action: PayloadAction<CategoryWithCount[]>) {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesWithCounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesWithCounts.fulfilled, (state, action: PayloadAction<CategoryWithCount[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategoriesWithCounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch categories';
      });
  },
});

import type { RootState } from '../store';

export const selectCategories = (state: RootState) => state.categoriesReducer.items;
export const selectCategoriesLoading = (state: RootState) => state.categoriesReducer.isLoading;
export const selectCategoriesError = (state: RootState) => state.categoriesReducer.error;

export default categorieSlice.reducer;