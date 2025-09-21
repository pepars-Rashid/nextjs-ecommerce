import { configureStore } from "@reduxjs/toolkit";

import productReducer from "./features/product-slice";
import cartReducer from "./features/cart-slice";
import wishlistReducer from "./features/wishlist-slice";

import { TypedUseSelectorHook, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    productReducer,
    cartReducer,
    wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
