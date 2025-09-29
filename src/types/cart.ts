import type { Product } from './product';
import type { WithQuantity } from './common';

// Cart items are just products with a quantity
export type CartItem = WithQuantity<Product>;

// Raw Cart Item from database
export type RawCartItem = {
  id: number; // cart item id (not used directly in UI)
  quantity: number;
  product: Product;
};

// Database Cart type (from schema)
export interface DatabaseCart {
  id: number;
  ownerId: string;
  status: 'active' | 'ordered' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

// Database Cart Item type (from schema)
export interface DatabaseCartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
}
