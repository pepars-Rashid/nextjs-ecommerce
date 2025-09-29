// Order Status enum
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

// Payment Status enum
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

// Database Order type (from schema)
export interface DatabaseOrder {
  id: number;
  ownerId: string;
  status: OrderStatus;
  subtotalAmount: string;
  discountAmount: string;
  shippingAmount: string;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  shippingAddressId?: number;
  billingAddressId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Database Order Item type (from schema)
export interface DatabaseOrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
}
