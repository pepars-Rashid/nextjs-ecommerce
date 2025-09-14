// WishlistItem interface to match the existing structure
export interface WishlistItem {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
}

// Type for the raw wishlist item data from the backend
type RawWishlistItem = {
  id: number;
  productId: number;
  status: string;
  createdAt: string;
};

// Function to normalize wishlist items from backend format to WishlistItem format
// Note: The backend only returns productId and status, so we'll need to fetch product details
export function normalizeWishlistItems(rawItems: RawWishlistItem[] | any[], productDetails?: any[]): WishlistItem[] {
  if (!rawItems || !Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((item) => {
    // If we have product details, use them, otherwise create minimal structure
    const productInfo = productDetails?.find(p => p.id === item.productId);
    
    return {
      id: item.productId, // Use productId as the wishlist item id for consistency
      title: productInfo?.title || `Product ${item.productId}`,
      price: productInfo ? Number(productInfo.price) || 0 : 0,
      discountedPrice: productInfo ? Number(productInfo.discountedPrice) || 0 : 0,
      quantity: 1, // Wishlist items typically have quantity of 1
      status: item.status || "available",
      imgs: productInfo?.imgs || {
        thumbnails: [],
        previews: [],
      },
    };
  });
}
