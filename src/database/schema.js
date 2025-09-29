// db/schema.ts
import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  numeric,
  pgEnum,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersSync } from 'drizzle-orm/neon';

// Enums
export const imageKindEnum = pgEnum("image_kind", ["thumbnail", "preview"]);
export const cartStatusEnum = pgEnum("cart_status", ["active", "ordered", "abandoned"]);
export const orderStatusEnum = pgEnum("order_status", ["pending","paid","shipped","completed","cancelled",]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paid", "refunded"]);

export const addresses = pgTable(
"addresses",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull().references(() => usersSync.id),
    fullName: varchar("full_name", { length: 255 }),
    line1: varchar("line1", { length: 255 }).notNull(),
    line2: varchar("line2", { length: 255 }),
    city: varchar("city", { length: 255 }).notNull(),
    state: varchar("state", { length: 255 }),
    postalCode: varchar("postal_code", { length: 32 }).notNull(),
    country: varchar("country", { length: 2 }).notNull(),
    phone: varchar("phone", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("addresses_owner_id_idx").on(t.ownerId),
  ]);

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  productSlug: varchar("productSlug", { length: 255 }).notNull().default('product-slug'),
  title: varchar("title", { length: 255 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  discountedPrice: numeric("discounted_price", { precision: 10, scale: 2 }).notNull().default("0"),
  stock: integer("stock").notNull().default(0),
  avgRating: numeric("avg_rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewsCount: integer("reviews_count").notNull().default(0),
  description: text("description"),
  detiledDescription: text("detiled_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  
}, (t) => [
  uniqueIndex("products_product_slug_unique").on(t.productSlug),
]);

// Product Images
export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    kind: imageKindEnum("kind").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
      index("product_images_product_id_idx").on(t.productId),
  ]);

// Categories
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    imgUrl: text("imgUrl").notNull().default("/blanck,png"),
  },
  (t) => [
    uniqueIndex("categories_slug_unique").on(t.slug),
  ]);

// Product <-> Category (many-to-many)
export const productCategories = pgTable(
  "product_categories",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ name: "product_categories_pk", columns: [t.productId, t.categoryId] }),
  ]
);

// Reviews
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    ownerId: text("owner_id").notNull().references(() => usersSync.id),
    rating: integer("rating").notNull(), // validate 1..5 in app or with a CHECK if you prefer
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),// validate 1..5 in app or with a CHECK if you prefer
  },
  (t) => [
    index("reviews_product_id_idx").on(t.productId),
    index("reviews_owner_id_idx").on(t.ownerId),
    uniqueIndex("reviews_owner_product_unique").on(t.ownerId, t.productId),
  ]);

// Carts
export const carts = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull().references(() => usersSync.id),
    status: cartStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("carts_owner_id_idx").on(t.ownerId),
  ]);

// Cart Items
export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("cart_items_cart_id_idx").on(t.cartId),
    uniqueIndex("cart_items_cart_product_unique").on(t.cartId, t.productId),
  ]);

// Wishlists (one per owner)
export const wishlists = pgTable(
  "wishlists",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull().references(() => usersSync.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("wishlists_owner_id_unique").on(t.ownerId),
  ]);

// Wishlist Items
export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: serial("id").primaryKey(),
    wishlistId: integer("wishlist_id")
      .notNull()
      .references(() => wishlists.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("wishlist_items_wishlist_id_idx").on(t.wishlistId),
    uniqueIndex("wishlist_items_wishlist_product_unique").on(
      t.wishlistId,
      t.productId
    ),
  ]);

// Orders
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull().references(() => usersSync.id),
    status: orderStatusEnum("status").notNull().default("pending"),
    subtotalAmount: numeric("subtotal_amount", { precision: 10, scale: 2 }).notNull(),
    discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    shippingAmount: numeric("shipping_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
    shippingAddressId: integer("shipping_address_id").references(() => addresses.id),
    billingAddressId: integer("billing_address_id").references(() => addresses.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("orders_owner_id_idx").on(t.ownerId),
  ]);

// Order Items
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull(),
  },
  (t) => [
    index("order_items_order_id_idx").on(t.orderId),
    uniqueIndex("order_items_order_product_unique").on(t.orderId, t.productId),
  ]);

// Relations
export const addressesRelations = relations(addresses, ({}) => ({}));

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  reviews: many(reviews),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
  orderItems: many(orderItems),
  categories: many(productCategories),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(productCategories),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, {
    fields: [productCategories.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productCategories.categoryId],
    references: [categories.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ many }) => ({
  items: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, { fields: [wishlistItems.wishlistId], references: [wishlists.id] }),
  product: one(products, { fields: [wishlistItems.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
    relationName: "shippingAddress",
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
    relationName: "billingAddress",
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));