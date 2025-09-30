import { Product, ListedProduct } from "@/types/product";

// Use the ListedProduct interface from actions

/**
 * Normalizes a single listed product to client Product interface
 */
export function normalizeProduct(listedProduct: ListedProduct): Product {
  const thumbnails = listedProduct.images
    .filter(img => img.kind === "thumbnail")
    .map(img => img.url);

  const previews = listedProduct.images
    .filter(img => img.kind === "preview")
    .map(img => img.url);

  return {
    id: listedProduct.id,
    title: listedProduct.title,
    price: parseFloat(listedProduct.price) || 0,
    discountedPrice: parseFloat(listedProduct.discountedPrice) || 0,
    reviews: listedProduct.reviewsCount || 0,
    imgs: {
      thumbnails,
      previews,
    },
  };
}

/**
 * Normalizes an array of listed products to client Product interface
 */
export function normalizeProducts(listedProducts: ListedProduct[]): Product[] {
  return listedProducts.map(normalizeProduct);
}

/**
 * Normalizes a single product from getProduct response
 */
export function normalizeSingleProduct(listedProduct: ListedProduct): Product {
  return normalizeProduct(listedProduct);
}

/**
 * Creates an empty product with default values
 */
export function createEmptyProduct(): Product {
  return {
    title: "",
    reviews: 0,
    price: 0,
    discountedPrice: 0,
    id: 0,
    imgs: {
      thumbnails: [],
      previews: [],
    },
  };
}
