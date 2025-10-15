import type { CartItem, RawCartItem } from '@/types/cart';

// Normalize a single product-like object to image URL arrays (thumbnails and previews identical)
function extractImageUrls(productLike: any): { thumbnails: string[]; previews: string[] } {
  // Prefer the new array-of-objects shape
  if (Array.isArray(productLike?.imagesArray)) {
    const urls = productLike.imagesArray.map((img: any) => img?.url).filter(Boolean) as string[];
    return { thumbnails: urls, previews: urls };
  }

  // Fallback: generic images array (with or without kind)
  if (Array.isArray(productLike?.images)) {
    const urls = productLike.images.map((img: any) => img?.url).filter(Boolean) as string[];
    return { thumbnails: urls, previews: urls };
  }

  // Already-normalized imgs present
  if (productLike?.imgs && (Array.isArray(productLike.imgs.thumbnails) || Array.isArray(productLike.imgs.previews))) {
    const thumbs = Array.isArray(productLike.imgs.thumbnails) ? productLike.imgs.thumbnails.filter(Boolean) : [];
    const prevs = Array.isArray(productLike.imgs.previews) ? productLike.imgs.previews.filter(Boolean) : [];
    // If one is empty, mirror the other per new requirement
    const urls = thumbs.length ? thumbs : prevs;
    const ensure = urls.length ? urls : [];
    return { thumbnails: ensure, previews: ensure };
  }

  return { thumbnails: [], previews: [] };
}

// Function to normalize cart items from backend format to CartItem format
export function normalizeCartItems(rawItems: RawCartItem[] | any[]): CartItem[] {
  if (!rawItems || !Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((item: any) => {
    const product = item?.product ?? {};

    const { thumbnails, previews } = extractImageUrls(product);

    const priceVal = (product as any).price;
    const discountedVal = (product as any).discountedPrice;
    const priceNum = typeof priceVal === 'string' ? parseFloat(priceVal) : Number(priceVal) || 0;
    const discountedNum = typeof discountedVal === 'string' ? parseFloat(discountedVal) : Number(discountedVal) || 0;

    return {
      id: (product as any).id ?? 0, // use product id for UI operations
      title: (product as any).title || '',
      price: priceNum,
      discountedPrice: discountedNum,
      productSlug: product.productSlug,
      reviews: Number((product as any).reviewsCount ?? 0),
      quantity: item?.quantity || 1,
      imgs: {
        thumbnails,
        previews,
      },
    } as CartItem;
  });
}
