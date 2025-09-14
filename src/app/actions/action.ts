"use server"
import { db } from "@/database/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
	products,
	productImages,
	categories,
	productCategories,
	carts,
	cartItems,
	wishlists,
	wishlistItems,
} from "@/database/schema";
import type { Product } from "@/types/product";
import { stackServerApp } from "@/stack-server";

export type ListProductsParams = {
	limit?: number;
	offset?: number;
	categoryIds?: number[];
	sort?: "latest" | "price_asc" | "price_desc";
};

function mapDbToProduct(
	p: any,
	images: Array<{ url: string; kind: "thumbnail" | "preview"; sortOrder: number }>
): Product {
	const thumbs = images
		.filter((i) => i.kind === "thumbnail")
		.sort((a, b) => a.sortOrder - b.sortOrder)
		.map((i) => i.url);
	const previews = images
		.filter((i) => i.kind === "preview")
		.sort((a, b) => a.sortOrder - b.sortOrder)
		.map((i) => i.url);
	return {
		id: Number(p.id),
		title: p.title,
		price: Number(p.price),
		discountedPrice: Number(p.discountedPrice),
		reviews: Number(p.reviewsCount ?? 0),
		imgs: { thumbnails: thumbs, previews },
	};
}

export async function listProducts(params: ListProductsParams = {}): Promise<Product[]> {
	const { limit = 9, offset = 0, categoryIds, sort = "latest" } = params;

	let base = db.select().from(products).limit(limit).offset(offset);
	if (sort === "price_asc") {
		// @ts-expect-error drizzle types for orderBy on js schema
		base = base.orderBy(products.price.asc());
	} else if (sort === "price_desc") {
		// @ts-expect-error drizzle types for orderBy on js schema
		base = base.orderBy(products.price);
	} else {
		// latest by id desc as a proxy
		// @ts-expect-error
		base = base.orderBy(products.id);
	}

	if (categoryIds && categoryIds.length) {
		try {
			const pc = await db
				.select({ productId: productCategories.productId })
				.from(productCategories)
				.where(inArray(productCategories.categoryId, categoryIds));
			const allowedIds = pc.map((r: any) => r.productId);
			if (!allowedIds.length) return [];
			// @ts-expect-error drizzle types for complex queries
			base = db.select().from(products).where(inArray(products.id, allowedIds)).limit(limit).offset(offset);
		} catch (error) {
			console.error('Error filtering by categories:', error);
			return [];
		}
	}

	try {
		const rows = await base;
		if (rows.length === 0) return [];
		const ids = rows.map((r: any) => r.id);
		const imgs = await db
			.select({
				productId: productImages.productId,
				url: productImages.url,
				kind: productImages.kind,
				sortOrder: productImages.sortOrder,
			})
			.from(productImages)
			.where(inArray(productImages.productId, ids));
		const productIdToImages = new Map<number, Array<{ url: string; kind: "thumbnail" | "preview"; sortOrder: number }>>();
		for (const im of imgs as any[]) {
			const list = productIdToImages.get(im.productId) ?? [];
			list.push({ url: im.url, kind: im.kind, sortOrder: im.sortOrder });
			productIdToImages.set(im.productId, list);
		}
		return rows.map((p: any) => mapDbToProduct(p, productIdToImages.get(p.id) ?? []));
	} catch (error) {
		console.error('Error fetching products:', error);
		return [];
	}
}

export async function getProduct(productId: number): Promise<Product | null> {
	const row = await db.select().from(products).where(eq(products.id, productId)).limit(1);
	if (!row.length) return null;
	const imgs = await db
		.select({ url: productImages.url, kind: productImages.kind, sortOrder: productImages.sortOrder })
		.from(productImages)
		.where(eq(productImages.productId, productId));
	return mapDbToProduct(row[0] as any, imgs as any);
}

export type CategoryWithCount = { id: number; name: string; slug: string; productCount: number; imgUrl: string };

export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
	const rows = await db
		.select({
			id: categories.id,
			name: categories.name,
			slug: categories.slug,
			imgUrl: categories.imgUrl,
			productCount: sql<number>`count(${productCategories.productId})`,
		})
		.from(categories)
		.leftJoin(productCategories, eq(categories.id, productCategories.categoryId))
		.groupBy(categories.id, categories.name, categories.slug, categories.imgUrl);
	return rows as any;
}

export async function countProducts(params: { categoryIds?: number[] } = {}): Promise<number> {
	const { categoryIds } = params;
	try {
		if (!categoryIds || categoryIds.length === 0) {
			const rows = await db.select({ value: sql<number>`count(*)` }).from(products);
			return Number((rows?.[0] as any)?.value ?? 0);
		}
		// Count distinct products that belong to any of the given categories
		const rows = await db
			.select({ value: sql<number>`count(distinct ${products.id})` })
			.from(products)
			.leftJoin(productCategories, eq(products.id, productCategories.productId))
			
			.where(inArray(productCategories.categoryId, categoryIds));
		return Number((rows?.[0] as any)?.value ?? 0);
	} catch (error) {
		console.error("Error counting products:", error);
		return 0;
	}
}

// Cart Actions
 async function getUserCart(ownerId: string) {
	try {
		// Get or create cart for user
		let userCart = await db.select().from(carts).where(eq(carts.ownerId, ownerId)).limit(1);
		
		if (!userCart.length) {
			const [newCart] = await db.insert(carts).values({
				ownerId,
				status: "active"
			}).returning();
			userCart = [newCart];
		}

		// Get cart items with product details
		const cartItemsData = await db
			.select({
				id: cartItems.id,
				productId: cartItems.productId,
				titleSnapshot: cartItems.titleSnapshot,
				imgSnapshot: cartItems.imgSnapshot,
				unitPrice: cartItems.unitPrice,
				unitDiscountedPrice: cartItems.unitDiscountedPrice,
				quantity: cartItems.quantity,
				createdAt: cartItems.createdAt,
			})
			.from(cartItems)
			.where(eq(cartItems.cartId, userCart[0].id));

		return cartItemsData;
	} catch (error) {
		console.error('Error getting user cart:', error);
		return [];
	}
}

 async function addToCart(ownerId: string, productId: number, quantity: number = 1) {
	try {
		// Get or create cart
		let userCart = await db.select().from(carts).where(eq(carts.ownerId, ownerId)).limit(1);
		
		if (!userCart.length) {
			const [newCart] = await db.insert(carts).values({
				ownerId,
				status: "active"
			}).returning();
			userCart = [newCart];
		}

		// Get product details for snapshot
		const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
		if (!product.length) throw new Error('Product not found');

		// Check if item already exists in cart
		const existingItem = await db
			.select()
			.from(cartItems)
			.where(and(eq(cartItems.cartId, userCart[0].id), eq(cartItems.productId, productId)))
			.limit(1);

		if (existingItem.length > 0) {
			// Update quantity
			await db
				.update(cartItems)
				.set({ quantity: existingItem[0].quantity + quantity })
				.where(eq(cartItems.id, existingItem[0].id));
		} else {
			// Add new item
			const imgs = await db
				.select({ url: productImages.url, kind: productImages.kind, sortOrder: productImages.sortOrder })
				.from(productImages)
				.where(eq(productImages.productId, productId));

			await db.insert(cartItems).values({
				cartId: userCart[0].id,
				productId,
				titleSnapshot: product[0].title,
				imgSnapshot: imgs[0].url, // You might want to get the first image here
				unitPrice: product[0].price,
				unitDiscountedPrice: product[0].discountedPrice,
				quantity,
			});
		}

		return { success: true };
	} catch (error) {
		console.error('Error adding to cart:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
}

 async function updateCartItemQuantity(ownerId: string, productId: number, quantity: number) {
	try {
		const userCart = await db.select().from(carts).where(eq(carts.ownerId, ownerId)).limit(1);
		if (!userCart.length) throw new Error('Cart not found');

		if (quantity <= 0) {
			// Remove item if quantity is 0 or negative
			await db
				.delete(cartItems)
				.where(and(eq(cartItems.cartId, userCart[0].id), eq(cartItems.productId, productId)));
		} else {
			// Update quantity
			await db
				.update(cartItems)
				.set({ quantity })
				.where(and(eq(cartItems.cartId, userCart[0].id), eq(cartItems.productId, productId)));
		}

		return { success: true };
	} catch (error) {
		console.error('Error updating cart item:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
}

 async function removeFromCart(ownerId: string, productId: number) {
	try {
		const userCart = await db.select().from(carts).where(eq(carts.ownerId, ownerId)).limit(1);
		if (!userCart.length) throw new Error('Cart not found');

		await db
			.delete(cartItems)
			.where(and(eq(cartItems.cartId, userCart[0].id), eq(cartItems.productId, productId)));

		return { success: true };
	} catch (error) {
		console.error('Error removing from cart:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
}

// Wishlist Actions
 async function getUserWishlist(ownerId: string) {
	try {
		// Get or create wishlist for user
		let userWishlist = await db.select().from(wishlists).where(eq(wishlists.ownerId, ownerId)).limit(1);
		
		if (!userWishlist.length) {
			const [newWishlist] = await db.insert(wishlists).values({
				ownerId
			}).returning();
			userWishlist = [newWishlist];
		}

		// Get wishlist items with product details
		const wishlistItemsData = await db
			.select({
				id: wishlistItems.id,
				productId: wishlistItems.productId,
				status: wishlistItems.status,
				createdAt: wishlistItems.createdAt,
			})
			.from(wishlistItems)
			.where(eq(wishlistItems.wishlistId, userWishlist[0].id));

		return wishlistItemsData;
	} catch (error) {
		console.error('Error getting user wishlist:', error);
		return [];
	}
}

 async function addToWishlist(ownerId: string, productId: number) {
	try {
		// Get or create wishlist
		let userWishlist = await db.select().from(wishlists).where(eq(wishlists.ownerId, ownerId)).limit(1);
		
		if (!userWishlist.length) {
			const [newWishlist] = await db.insert(wishlists).values({
				ownerId
			}).returning();
			userWishlist = [newWishlist];
		}

		// Check if already in wishlist
		const existingItem = await db
			.select()
			.from(wishlistItems)
			.where(and(eq(wishlistItems.wishlistId, userWishlist[0].id), eq(wishlistItems.productId, productId)))
			.limit(1);

		if (existingItem.length > 0) {
			return { success: false, error: 'Item already in wishlist' };
		}

		// Add to wishlist
		await db.insert(wishlistItems).values({
			wishlistId: userWishlist[0].id,
			productId,
			status: "available"
		});

		return { success: true };
	} catch (error) {
		console.error('Error adding to wishlist:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
}

 async function removeFromWishlist(ownerId: string, productId: number) {
	try {
		const userWishlist = await db.select().from(wishlists).where(eq(wishlists.ownerId, ownerId)).limit(1);
		if (!userWishlist.length) throw new Error('Wishlist not found');

		await db
			.delete(wishlistItems)
			.where(and(eq(wishlistItems.wishlistId, userWishlist[0].id), eq(wishlistItems.productId, productId)));

		return { success: true };
	} catch (error) {
		console.error('Error removing from wishlist:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
}

 async function isInWishlist(ownerId: string, productId: number): Promise<boolean> {
	try {
		const userWishlist = await db.select().from(wishlists).where(eq(wishlists.ownerId, ownerId)).limit(1);
		if (!userWishlist.length) return false;

		const item = await db
			.select()
			.from(wishlistItems)
			.where(and(eq(wishlistItems.wishlistId, userWishlist[0].id), eq(wishlistItems.productId, productId)))
			.limit(1);

		return item.length > 0;
	} catch (error) {
		console.error('Error checking wishlist status:', error);
		return false;
	}
}

// User-specific Cart Actions (with Stack Auth)
export async function addToCartForUser(productId: number, quantity: number = 1) {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	return await addToCart(user.id, productId, quantity);
}

export async function updateCartItemQuantityForUser(productId: number, quantity: number) {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	return await updateCartItemQuantity(user.id, productId, quantity);
}

export async function removeFromCartForUser(productId: number) {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	return await removeFromCart(user.id, productId);
}

export async function getUserCartForUser() {
	const user = await stackServerApp.getUser();
	if (!user) return [];

	return await getUserCart(user.id);
}

// User-specific Wishlist Actions (with Stack Auth)
export async function addToWishlistForUser(productId: number) {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	return await addToWishlist(user.id, productId);
}

export async function removeFromWishlistForUser(productId: number) {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	return await removeFromWishlist(user.id, productId);
}

export async function getUserWishlistForUser() {
	const user = await stackServerApp.getUser();
	if (!user) return [];

	return await getUserWishlist(user.id);
}

export async function isInWishlistForUser(productId: number): Promise<boolean> {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	return await isInWishlist(user.id, productId);
}