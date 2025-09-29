import { RawWishlistItemWithProduct, WishlistItem } from "@/types/wishlist";

// Function to normalize wishlist items from backend format to WishlistItem format
export function normalizeWishlistItems(rawItems: RawWishlistItemWithProduct[] | any[]): WishlistItem[] {
  if (!rawItems || !Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((item) => {
    const product = item.product || ({} as RawWishlistItemWithProduct['product']);

    const thumbnails = product.images?.filter((img: any) => img.kind === 'thumbnail').map((img: any) => img.url) || [];
    const previews = product.images?.filter((img: any) => img.kind === 'preview').map((img: any) => img.url) || [];

    const priceNum = typeof (product as any).price === 'string' ? parseFloat((product as any).price) : Number((product as any).price) || 0;
    const discountedNum = typeof (product as any).discountedPrice === 'string' ? parseFloat((product as any).discountedPrice) : Number((product as any).discountedPrice) || 0;

    return {
      id: (product as any).id ?? item.productId, // prefer product id
      title: (product as any).title || `Product ${item.productId}`,
      price: priceNum,
      discountedPrice: discountedNum,
      reviews: Number((product as any).reviewsCount ?? 0),
      quantity: 1, // Wishlist items typically have quantity of 1
      status: 'available',
      imgs: {
        thumbnails,
        previews,
      },
    };
  });
}
