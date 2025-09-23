// WishlistItem interface to match the cart pattern
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

// Type for the raw wishlist item data from the backend with product details
type RawWishlistItemWithProduct = {
  id: number;
  productId: number;
  status: string;
  createdAt: string;
  // Product details joined from products table
  title?: string;
  price?: string;
  discountedPrice?: string;
  description?: string;
  // Images from productImages table
  images?: Array<{
    url: string;
    kind: 'thumbnail' | 'preview';
    sortOrder: number;
  }>;
};

// Function to normalize wishlist items from backend format to WishlistItem format
export function normalizeWishlistItems(rawItems: RawWishlistItemWithProduct[] | any[]): WishlistItem[] {
  if (!rawItems || !Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((item) => {
    // Group images by kind
    const thumbnails = item.images?.filter(img => img.kind === 'thumbnail').map(img => img.url) || [];
    const previews = item.images?.filter(img => img.kind === 'preview').map(img => img.url) || [];
    
    return {
      id: item.productId, // Use productId as the wishlist item id for consistency
      title: item.title || `Product ${item.productId}`,
      price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price) || 0,
      discountedPrice: typeof item.discountedPrice === 'string' 
        ? parseFloat(item.discountedPrice) 
        : Number(item.discountedPrice) || 0,
      quantity: 1, // Wishlist items typically have quantity of 1
      status: item.status || "available",
      imgs: {
        thumbnails,
        previews,
      },
    };
  });
}
