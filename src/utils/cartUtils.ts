import type { CartItem, RawCartItem } from '@/types/cart';
import type { ProductWithImages } from '@/types/product';

// Remove the local `export interface CartItem { ... }`
// Keep your existing RawCartItem if you still need it for mapping DB → UI

// example usage (no functional changes required)
// function mapToCartItem(raw: RawCartItem): CartItem { ... }

// Function to normalize cart items from backend format to CartItem format
export function normalizeCartItems(rawItems: RawCartItem[] | any[]): CartItem[] {
  if (!rawItems || !Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((item: RawCartItem) => {
    const product = (item.product || {}) as ProductWithImages;

    const thumbnails = product.images?.filter(img => img.kind === 'thumbnail').map(img => img.url) || [];
    const previews = product.images?.filter(img => img.kind === 'preview').map(img => img.url) || [];

    const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price) || 0;
    const discountedNum = typeof product.discountedPrice === 'string' ? parseFloat(product.discountedPrice) : Number(product.discountedPrice) || 0;

    return {
      id: product.id, // use product id for UI operations (add/remove/update)
      title: product.title || '',
      price: priceNum,
      discountedPrice: discountedNum,
      reviews: Number((product as any).reviewsCount ?? 0),
      quantity: item.quantity || 1,
      imgs: {
        thumbnails,
        previews,
      },
    };
  });
}
