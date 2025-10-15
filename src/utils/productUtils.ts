import { Product, ListedProduct } from "@/types/product";

// Normalizes a single listed product to client Product interface
export function normalizeProduct(listedProduct: ListedProduct): Product {
  // Ensure we can handle missing or null imagesArray gracefully
  const images = Array.isArray(listedProduct.imagesArray) ? listedProduct.imagesArray : [];
  const urls = images.map((img) => img?.url).filter(Boolean) as string[];

  const thumbnails = urls;
  const previews = urls;

  return {
    id: listedProduct.id,
    productSlug: listedProduct.productSlug || '',
    title: listedProduct.title,
    stock: listedProduct.stock,
    price: parseFloat(listedProduct.price) || 0,
    description: listedProduct.description,
    discountedPrice: parseFloat(listedProduct.discountedPrice) || 0,
    reviews: listedProduct.reviewsCount || 0,
    imgs: {
      thumbnails,
      previews,
    },
  };
}

// Normalizes an array of listed products to client Product interface
export function normalizeProducts(listedProducts: ListedProduct[]): Product[] {
  return listedProducts.map(normalizeProduct);
}

// Creates an empty product with default values
export function createEmptyProduct(): Product {
  return {
    title: "",
    productSlug: "",
    description: "",
    detailedDescription: '',
    stock: 0,
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
