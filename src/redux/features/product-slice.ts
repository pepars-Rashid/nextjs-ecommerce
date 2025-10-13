import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";
import { listProducts, getProduct } from "@/app/actions/action";
import type { ListProductsParams } from "@/types/product";
import { normalizeProducts, createEmptyProduct, normalizeProduct } from "@/utils/productUtils";
import { ProductSortOption } from "@/types/common";
import type { RootState } from '../store';

interface InitialState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  
  // Current product for quick view/details
  currentProduct: Product;
  currentProductLoading: boolean;
  currentProductError: string | null;
  
  // Filter and pagination state
  filters: {
    categoryIds: number[];
    sort?: ProductSortOption;
    minPrice?: number;
    maxPrice?: number;
    limit: number;
    offset: number;
  };
  
  // Pagination info
  totalCount: number;
  hasMore: boolean;
}

const initialState: InitialState = {
  items: [],
  isLoading: false,
  error: null,
  
  currentProduct: createEmptyProduct(),
  currentProductLoading: false,
  currentProductError: null,
  
  filters: {
    categoryIds: [],
    sort: "latest",
    limit: 9,
    offset: 0,
  },
  
  totalCount: 0,
  hasMore: true,
};

// Extended params interface for better type safety
interface FetchProductsParams extends ListProductsParams {
  append?: boolean;
  categoryIds?: number[]; // Add categoryIds to the params
}

// Async thunks
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params: FetchProductsParams = {}, { rejectWithValue, getState }) => {
    try {
      // Prefer passing categoryIds directly; server resolves slugs only if needed
      const response = await listProducts(params);
      return {
        products: normalizeProducts(response),
        append: params.append || false,
        hasMore: response.length === (params.limit || 9), // Check if we got a full page
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
);

// Fetch single product by slug
export const fetchProductBySlug = createAsyncThunk(
  'product/fetchProductBySlug',
  async (productSlug: string, { rejectWithValue }) => {
    try {
      const response = await getProduct(productSlug);
      if (!response) {
        throw new Error('Product not found');
      }
      return normalizeProduct(response);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch product');
    }
  }
);

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    // Manual product setting (for backward compatibility)
    setProducts(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    
    // Set current product (for quick view/details)
    setCurrentProduct(state, action: PayloadAction<Product>) {
      state.currentProduct = action.payload;
      state.currentProductLoading = false;
      state.currentProductError = null;
    },
    
    // Update filters
    updateFilters(state, action: PayloadAction<Partial<InitialState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset filters to default
    resetFilters(state) {
      state.filters = {
        categoryIds: [],
        sort: "latest",
        minPrice: undefined,
        maxPrice: undefined,
        limit: 9,
        offset: 0,
      };
    },
    
    // Clear products (useful for filter changes)
    clearProducts(state) {
      state.items = [];
      state.totalCount = 0;
      state.hasMore = true;
    },
    
    // Reset current product
    resetCurrentProduct(state) {
      state.currentProduct = createEmptyProduct();
      state.currentProductLoading = false;
      state.currentProductError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts cases
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { products, append, hasMore } = action.payload;
        
        if (append) {
          // Append for pagination
          state.items = [...state.items, ...products];
        } else {
          // Replace for new search/filter
          state.items = products;
        }
        
        state.isLoading = false;
        state.error = null;
        state.hasMore = hasMore;
        state.totalCount = append ? state.totalCount + products.length : products.length;
        
        // Update offset for next pagination
        state.filters.offset = state.items.length;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch products';
      })
      
      // fetchProductBySlug cases
      .addCase(fetchProductBySlug.pending, (state) => {
        state.currentProductLoading = true;
        state.currentProductError = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
        state.currentProductLoading = false;
        state.currentProductError = null;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.currentProductLoading = false;
        state.currentProductError = action.payload as string || 'Failed to fetch product';
      });
  }
});

export const {
  setProducts,
  setCurrentProduct,
  updateFilters,
  resetFilters,
  clearProducts,
  resetCurrentProduct,
} = productSlice.actions;

// Selectors for easier state access
export const selectProducts = (state: { productReducer: InitialState }) => state.productReducer.items;
export const selectProductsLoading = (state: { productReducer: InitialState }) => state.productReducer.isLoading;
export const selectProductsError = (state: { productReducer: InitialState }) => state.productReducer.error;
export const selectCurrentProduct = (state: { productReducer: InitialState }) => state.productReducer.currentProduct;
export const selectCurrentProductLoading = (state: { productReducer: InitialState }) => state.productReducer.currentProductLoading;
export const selectCurrentProductError = (state: { productReducer: InitialState }) => state.productReducer.currentProductError;
export const selectFilters = (state: { productReducer: InitialState }) => state.productReducer.filters;
export const selectHasMore = (state: { productReducer: InitialState }) => state.productReducer.hasMore;
export const selectTotalCount = (state: { productReducer: InitialState }) => state.productReducer.totalCount;

export default productSlice.reducer;
