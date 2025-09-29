import type { Product } from './product';
import type { WithQuantity, WithStatus } from './common';

// Wishlist items reuse product, adding quantity and optional status
export type WishlistItem = WithStatus<WithQuantity<Product>>;

// Raw Wishlist Item from database
export type RawWishlistItemWithProduct = {
  id: number; // wishlist item id (not used directly in UI)
  productId: number;
  product: Product;
};

// Database Wishlist type (from schema)
export interface DatabaseWishlist {
  id: number;
  ownerId: string;
  createdAt: Date;
}

// Database Wishlist Item type (from schema)
export interface DatabaseWishlistItem {
  id: number;
  wishlistId: number;
  productId: number;
  createdAt: Date;
}