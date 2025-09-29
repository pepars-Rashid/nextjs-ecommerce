// Image Kind enum
export type ImageKind = 'thumbnail' | 'preview';

// Database Product Image type (from schema)
export interface DatabaseProductImage {
  id: number;
  productId: number;
  url: string;
  kind: ImageKind;
  sortOrder: number;
  createdAt: Date;
}

// Image with metadata
export interface ImageWithMetadata {
  url: string;
  kind: ImageKind;
  sortOrder?: number;
}

// Product Images structure
export interface ProductImages {
  thumbnails: string[];
  previews: string[];
}