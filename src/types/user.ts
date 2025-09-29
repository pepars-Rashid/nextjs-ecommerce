// Database Address type (from schema)
export interface DatabaseAddress {
  id: number;
  ownerId: string;
  fullName?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User type (basic structure)
export interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}
