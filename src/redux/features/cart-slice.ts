import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { 
  getUserCartForUser,
  addToCartForUser,
  updateCartItemQuantityForUser,
  removeFromCartForUser 
} from "@/app/actions/action";
import { normalizeCartItems } from "@/utils/cartUtils";
import type { CartItem } from "@/types/cart";

// Re-export CartItem interface for convenience

 interface CartState {
  items: CartItem[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  addStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  updateStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  removeStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  clearStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
}

const initialState: CartState = {
  items: [],
  status: 'idle',
  error: null,
  addStatus: 'idle',
  updateStatus: 'idle',
  removeStatus: 'idle',
  clearStatus: 'idle',
};

// Async thunks
export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async () => {
    const response = await getUserCartForUser();
    return normalizeCartItems(response);
  }
);

export const addCartItemAsync = createAsyncThunk(
  'cart/addCartItem',
  async (item: { productId: number; quantity: number }, { getState }) => {
    const state = getState() as RootState;
    const existingItem = state.cartReducer.items.find(cartItem => cartItem.id === item.productId);
    
    if (existingItem) {
      // If item exists, update quantity instead of adding new item
      const newQuantity = existingItem.quantity + item.quantity;
      await updateCartItemQuantityForUser(item.productId, newQuantity);
    } else {
      // If item doesn't exist, add it normally
      await addToCartForUser(item.productId, item.quantity);
    }
    
    // Refetch cart items to get the updated list
    const response = await getUserCartForUser();
    return normalizeCartItems(response);
  }
);

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItem',
  async ({ id, quantity }: { id: number; quantity: number }) => {
    await updateCartItemQuantityForUser(id, quantity);
    // Refetch cart items to get the updated list
    const response = await getUserCartForUser();
    return normalizeCartItems(response);
  }
);

export const removeCartItemAsync = createAsyncThunk(
  'cart/removeCartItem',
  async (id: number) => {
    await removeFromCartForUser(id);
    // Refetch cart items to get the updated list
    const response = await getUserCartForUser();
    return normalizeCartItems(response);
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async () => {
    const response = await getUserCartForUser();
    const items = normalizeCartItems(response);
    
    // Remove all items
    for (const item of items) {
      await removeFromCartForUser(item.id);
    }
    
    return [];
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = normalizeCartItems(action.payload);
      state.status = 'succeeded';
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAddStatus: (state) => {
      state.addStatus = 'idle';
    },
    resetUpdateStatus: (state) => {
      state.updateStatus = 'idle';
    },
    resetRemoveStatus: (state) => {
      state.removeStatus = 'idle';
    },
    resetClearStatus: (state) => {
      state.clearStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart items
      .addCase(fetchCartItems.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch cart items';
      })
      // Add cart item
      .addCase(addCartItemAsync.pending, (state) => {
        state.addStatus = 'pending';
        state.error = null;
      })
      .addCase(addCartItemAsync.fulfilled, (state, action) => {
        state.addStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(addCartItemAsync.rejected, (state, action) => {
        state.addStatus = 'failed';
        state.error = action.error.message || 'Failed to add item to cart';
      })
      // Update cart item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.updateStatus = 'pending';
        state.error = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.error.message || 'Failed to update cart item';
      })
      // Remove cart item
      .addCase(removeCartItemAsync.pending, (state) => {
        state.removeStatus = 'pending';
        state.error = null;
      })
      .addCase(removeCartItemAsync.fulfilled, (state, action) => {
        state.removeStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(removeCartItemAsync.rejected, (state, action) => {
        state.removeStatus = 'failed';
        state.error = action.error.message || 'Failed to remove item from cart';
      })
      // Clear cart
      .addCase(clearCartAsync.pending, (state) => {
        state.clearStatus = 'pending';
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.clearStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.clearStatus = 'failed';
        state.error = action.error.message || 'Failed to clear cart';
      });
  },
});

export const { 
  setCartItems, 
  clearError, 
  resetAddStatus, 
  resetUpdateStatus, 
  resetRemoveStatus,
  resetClearStatus 
} = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = (state: RootState) => {
  return state.cartReducer.items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
};

export default cartSlice.reducer;