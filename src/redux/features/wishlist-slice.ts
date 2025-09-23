import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { 
  getUserWishlistForUser,
  addToWishlistForUser,
  removeFromWishlistForUser,
  isInWishlistForUser 
} from "@/app/actions/action";
import { normalizeWishlistItems, WishlistItem } from "@/utils/wishlistUtils";

interface WishlistState {
  items: WishlistItem[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  addStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  removeStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  clearStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  checkStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  isInWishlist: { [key: number]: boolean }; // Track which products are in wishlist
}

const initialState: WishlistState = {
  items: [],
  status: 'idle',
  error: null,
  addStatus: 'idle',
  removeStatus: 'idle',
  clearStatus: 'idle',
  checkStatus: 'idle',
  isInWishlist: {},
};

// Async thunks
export const fetchWishlistItems = createAsyncThunk(
  'wishlist/fetchWishlistItems',
  async () => {
    const response = await getUserWishlistForUser();
    
      return normalizeWishlistItems(response);
  });

export const addWishlistItemAsync = createAsyncThunk(
  'wishlist/addWishlistItem',
  async (productId: number) => {
    const result = await addToWishlistForUser(productId);
    if (!result.success) {
      throw new Error(result.error || 'Failed to add to wishlist');
    }
    
    // Refetch wishlist items to get the updated list
    const response = await getUserWishlistForUser();
      return normalizeWishlistItems(response);
    });

export const removeWishlistItemAsync = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async (productId: number) => {
    const result = await removeFromWishlistForUser(productId);
    if (!result.success) {
      throw new Error(result.error || 'Failed to remove from wishlist');
    }
    
    // Refetch wishlist items to get the updated list
    const response = await getUserWishlistForUser();
      return normalizeWishlistItems(response);
    });

export const clearWishlistAsync = createAsyncThunk(
  'wishlist/clearWishlist',
  async () => {
    // Since we don't have a clearWishlist function, we'll remove items one by one
    const response = await getUserWishlistForUser();
    
    // Remove all items
    for (const item of response) {
      await removeFromWishlistForUser(item.productId);
    }
    
    // Return empty array
    return [];
  }
);

export const checkIsInWishlistAsync = createAsyncThunk(
  'wishlist/checkIsInWishlist',
  async (productId: number) => {
    const isInWishlist = await isInWishlistForUser(productId);
    return { productId, isInWishlist };
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAddStatus: (state) => {
      state.addStatus = 'idle';
    },
    resetRemoveStatus: (state) => {
      state.removeStatus = 'idle';
    },
    resetClearStatus: (state) => {
      state.clearStatus = 'idle';
    },
    resetCheckStatus: (state) => {
      state.checkStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist items
      .addCase(fetchWishlistItems.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        // Update isInWishlist tracking
        action.payload.forEach(item => {
          state.isInWishlist[item.id] = true;
        });
      })
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch wishlist items';
      })
      // Add wishlist item
      .addCase(addWishlistItemAsync.pending, (state) => {
        state.addStatus = 'pending';
        state.error = null;
      })
      .addCase(addWishlistItemAsync.fulfilled, (state, action) => {
        state.addStatus = 'succeeded';
        state.items = action.payload;
        // Update isInWishlist tracking
        state.isInWishlist = {};
        action.payload.forEach(item => {
          state.isInWishlist[item.id] = true;
        });
      })
      .addCase(addWishlistItemAsync.rejected, (state, action) => {
        state.addStatus = 'failed';
        state.error = action.error.message || 'Failed to add item to wishlist';
      })
      // Remove wishlist item
      .addCase(removeWishlistItemAsync.pending, (state) => {
        state.removeStatus = 'pending';
        state.error = null;
      })
      .addCase(removeWishlistItemAsync.fulfilled, (state, action) => {
        state.removeStatus = 'succeeded';
        state.items = action.payload;
        // Update isInWishlist tracking
        state.isInWishlist = {};
        action.payload.forEach(item => {
          state.isInWishlist[item.id] = true;
        });
      })
      .addCase(removeWishlistItemAsync.rejected, (state, action) => {
        state.removeStatus = 'failed';
        state.error = action.error.message || 'Failed to remove item from wishlist';
      })
      // Clear wishlist
      .addCase(clearWishlistAsync.pending, (state) => {
        state.clearStatus = 'pending';
        state.error = null;
      })
      .addCase(clearWishlistAsync.fulfilled, (state, action) => {
        state.clearStatus = 'succeeded';
        state.items = action.payload;
        state.isInWishlist = {};
      })
      .addCase(clearWishlistAsync.rejected, (state, action) => {
        state.clearStatus = 'failed';
        state.error = action.error.message || 'Failed to clear wishlist';
      })
      // Check is in wishlist
      .addCase(checkIsInWishlistAsync.pending, (state) => {
        state.checkStatus = 'pending';
      })
      .addCase(checkIsInWishlistAsync.fulfilled, (state, action) => {
        state.checkStatus = 'succeeded';
        state.isInWishlist[action.payload.productId] = action.payload.isInWishlist;
      })
      .addCase(checkIsInWishlistAsync.rejected, (state, action) => {
        state.checkStatus = 'failed';
        state.error = action.error.message || 'Failed to check wishlist status';
      });
  },
});

export const { 
  setWishlistItems, 
  clearError, 
  resetAddStatus, 
  resetRemoveStatus,
  resetClearStatus,
  resetCheckStatus 
} = wishlistSlice.actions;

export const selectWishlistItems = (state: RootState) => state.wishlistReducer.items;

export const selectIsInWishlist = (state: RootState, productId: number) => 
  state.wishlistReducer.isInWishlist[productId] || false;

export default wishlistSlice.reducer;
