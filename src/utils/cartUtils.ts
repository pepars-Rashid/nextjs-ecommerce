// CartItem interface to avoid circular dependency
export interface CartItem {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
}

// Type for the raw cart item data from the backend
type RawCartItem = {
  id: number;
  productId: number;
  titleSnapshot: string;
  imgSnapshot: string;
  unitPrice: string;
  unitDiscountedPrice: string;
  quantity: number;
  createdAt: string;
};

// Function to normalize cart items from backend format to CartItem format
export function normalizeCartItems(rawItems: RawCartItem[] | any[]): CartItem[] {
  if (!rawItems || !Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((item) => ({
    id: item.productId, // Use productId as the cart item id for consistency with existing logic
    title: item.titleSnapshot || item.title || "",
    price: typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : Number(item.unitPrice) || 0,
    discountedPrice: typeof item.unitDiscountedPrice === 'string' 
      ? parseFloat(item.unitDiscountedPrice) 
      : Number(item.unitDiscountedPrice) || 0,
    quantity: item.quantity || 1,
    imgs: {
      thumbnails: item.imgSnapshot ? [item.imgSnapshot] : [],
      previews: item.imgSnapshot ? [item.imgSnapshot] : [],
    },
  }));
}
