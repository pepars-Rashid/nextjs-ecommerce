import { ProductSortOption } from "./common";

// Shared image structure so we don't repeat it
export type ProductImages = {
  thumbnails: string[];
  previews: string[];
};

// Core UI-facing product type (numeric prices, ready for display)
export interface Product {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  reviews: number;
  imgs?: ProductImages;
}

// DB-listed product returned by listProducts (string prices, images with kind/url)
export type ListedProductImage = {
  key: string;
  url: string;
};

export interface ListedProduct {
  id: number;
  title: string;
  price: string;
  discountedPrice: string;
  reviewsCount: number;
  description: string;
  detailedDescription?: string;
  imagesArray: ListedProductImage[];
}

// List Products Parameters
export type ListProductsParams = {
  limit?: number;
  offset?: number;
  categoryIds?: number[];
  sort?: ProductSortOption;
};

// Back-compat alias used in utils
export type ProductWithImages = ListedProduct;
