import { RawWishlistItemWithProduct, WishlistItem } from "@/types/wishlist";

function extractImageUrls(productLike: any): { thumbnails: string[]; previews: string[] } {
  if (Array.isArray(productLike?.imagesArray)) {
    const urls = productLike.imagesArray.map((img: any) => img?.url).filter(Boolean) as string[];
    return { thumbnails: urls, previews: urls };
  }
  if (Array.isArray(productLike?.images)) {
    const urls = productLike.images.map((img: any) => img?.url).filter(Boolean) as string[];
    return { thumbnails: urls, previews: urls };
  }
  if (productLike?.imgs && (Array.isArray(productLike.imgs.thumbnails) || Array.isArray(productLike.imgs.previews))) {
    const thumbs = Array.isArray(productLike.imgs.thumbnails) ? productLike.imgs.thumbnails.filter(Boolean) : [];
    const prevs = Array.isArray(productLike.imgs.previews) ? productLike.imgs.previews.filter(Boolean) : [];
    const urls = thumbs.length ? thumbs : prevs;
    const ensure = urls.length ? urls : [];
    return { thumbnails: ensure, previews: ensure };
  }
  return { thumbnails: [], previews: [] };
}

// Function to normalize wishlist items from backend format to WishlistItem format
export function normalizeWishlistItems(rawItems: RawWishlistItemWithProduct[] | any[]): WishlistItem[] {
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
      id: (product as any).id ?? item.productId, // prefer product id
      title: (product as any).title || `Product ${item.productId}`,
      price: priceNum,
      discountedPrice: discountedNum,
      reviews: Number((product as any).reviewsCount ?? 0),
      quantity: 1,
      status: 'available',
      imgs: {
        thumbnails,
        previews,
      },
    } as WishlistItem;
  });
}
