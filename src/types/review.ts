// Database Review type (from schema)
export interface DatabaseReview {
    id: number;
    productId: number;
    ownerId: string;
    rating: number; // 1-5
    comment?: string;
    createdAt: Date;
  }