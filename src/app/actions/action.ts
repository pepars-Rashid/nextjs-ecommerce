"use server"
import { db } from "@/database/db";
import { and, asc, between, count, desc, eq, inArray} from "drizzle-orm";
import {
	products,
	categories,
	productCategories,
	carts,
	cartItems,
	wishlists,
	wishlistItems,
} from "@/database/schema";
import { stackServerApp } from "@/stack-server";
import type { ListedProduct } from "@/types/product";
import { ListProductsParams } from "@/types/product";
import { CategoryWithCount } from "@/types/category";

export async function listProducts(params: ListProductsParams = {}): Promise<ListedProduct[]> {
  try {
	const { 
	  limit = 9, 
	  offset = 0, 
	  categorySlugs = [], 
	  minPrice = 0,
	  maxPrice = 1999,
	  sort = "latest" 
	} = params;

	// Validate numeric parameters
	if (limit < 1 || limit > 20) {
	  throw new Error("Limit must be between 1 and 20");
	}
	
	if (offset < 0) {
	  throw new Error("Offset must be non-negative");
	}

	// Validate price range
	if (minPrice < 0) {
	  throw new Error("Minimum price must be non-negative");
	}
	
	if (maxPrice < 0) {
	  throw new Error("Maximum price must be non-negative");
	}
	
	if (minPrice > maxPrice) {
	  throw new Error("Minimum price cannot be greater than maximum price");
	}

	// Build orderBy clause
	let orderByClause;
	switch (sort) {
	  case "price_asc": orderByClause = [asc(products.discountedPrice)];
		break;
	  case "price_desc": orderByClause = [desc(products.discountedPrice)];
		break;
	  case "latest": orderByClause = [desc(products.id)];
		break;
	  case "oldest": orderByClause = [asc(products.id)];
		break;
	  default: orderByClause = [desc(products.id)];
		break;
	}

	// Build where conditions array
	const whereConditions = [];
	
	// Add price range filter (always applied with defaults: 0 to 1999)
	whereConditions.push(between(products.discountedPrice, minPrice.toString(), maxPrice.toString()));
	
	// Handle category filtering by slugs
	if (categorySlugs && categorySlugs.length > 0) {
	  // Get category products by joining with categories table and filtering by slugs
	  const categoryProducts = await db
		.select({ productId: productCategories.productId })
		.from(productCategories)
		.innerJoin(categories, eq(productCategories.categoryId, categories.id))
		.where(inArray(categories.slug, categorySlugs))
		.catch(error => {
		  throw new Error(`Failed to fetch category products: ${error.message}`);
		});

	  const allowedProductIds = categoryProducts.map(r => r.productId);
	  
	  if (allowedProductIds.length === 0) {
		return [];
	  }
	  
	  whereConditions.push(inArray(products.id, allowedProductIds));
	}
	
	// Combine all where conditions
	const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

	const productsWithImages = await db.query.products.findMany({
	  columns: {
		id: true,
		title: true,
		price: true,
		productSlug: true,
		discountedPrice: true,
		reviewsCount: true,
		description: true,
		imagesArray: true,
	  },
	  limit: limit,
	  offset: offset,
	  where: whereClause,
	  orderBy: orderByClause,
	}).catch(error => {
	  throw new Error(`Failed to fetch products: ${error.message}`);
	});

	console.log('listProducts called')

	return productsWithImages as ListedProduct[];

  } catch (error) {
	console.error("Error in listProducts:", error);
	return [];
  }
}

export async function getProduct(productSlug: string): Promise<ListedProduct | null> {
	try {
		const product = await db.query.products.findFirst({
			columns: {
				id: true,
				productSlug: true,
				title: true,
				price: true,
				discountedPrice: true,
				reviewsCount: true,
				description: true,
				imagesArray: true,
				detiledDescription: true,
			},
			where: eq(products.productSlug, productSlug),
		}).catch(error => {
			throw new Error(`Failed to fetch product: ${error.message}`);
		});

		console.log("getProduct called for productSlug:", productSlug);
		return product as ListedProduct | null;
	} catch (error) {
		console.error("Error in getProduct:", error);
		return null;
	}
}

export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
	const rows = await db
		.select({
			id: categories.id,
			name: categories.name,
			slug: categories.slug,
			img: categories.img,
			productCount: count(productCategories.productId).mapWith(Number),
		})
		.from(categories)
		.leftJoin(productCategories, eq(categories.id, productCategories.categoryId))
		.groupBy(categories.id, categories.name, categories.slug, categories.img);

	console.log("listCategoriesWithCounts called");	
	return rows as CategoryWithCount[];
}

async function getUserCart(ownerId: string) {
	try {
		let userCart = await db.select().from(carts).where(eq(carts.ownerId, ownerId)).limit(1);
		
		if (!userCart.length) {
			const [newCart] = await db.insert(carts).values({
				ownerId,
				status: "active"
			}).returning();
			userCart = [newCart];
		}

		const cartItemsData = await db.query.cartItems.findMany({
			columns: {
				id: true,
				quantity: true,
			},
			where: eq(cartItems.cartId, userCart[0].id),
			with: {
				product: {
					columns: {
						id: true,
						title: true,
						price: true,
						discountedPrice: true,
						imagesArray: true,
						description: true,
					},
				},
			},
		});
		
		return cartItemsData;
	} catch (error) {
		console.error('Error getting user cart:', error);
		return [];
	}
}

 async function addToCart(ownerId: string, productId: number, quantity: number = 1) {
	// we should take the product details snapshot from the client side
	try {
		let userCart = await db.select().from(carts).where(eq(carts.ownerId, ownerId)).limit(1);
		
		if (!userCart.length) {
			const [newCart] = await db.insert(carts).values({
				ownerId,
				status: "active"
			}).returning();
			userCart = [newCart];
		}

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
			await db.insert(cartItems).values({
				cartId: userCart[0].id,
				productId,
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

			// Update quantity
			await db
				.update(cartItems)
				.set({ quantity })
				.where(and(eq(cartItems.cartId, userCart[0].id), eq(cartItems.productId, productId)));

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
		const wishlistItemsData = await db.query.wishlistItems.findMany({
			columns: {
				id: true,
				productId: true,
			},
			where: eq(wishlistItems.wishlistId, userWishlist[0].id),
			with: {
				product: {
					columns: {
						id: true,
						title: true,
						price: true,
						discountedPrice: true,
						imagesArray: true,
						description: true,
					},
				},
			},
		});

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

// User-specific Cart Actions (with Stack Auth)
export async function addToCartForUser(productId: number, quantity: number = 1) {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	console.log("addToCartForUser called for user");
	return await addToCart(user.id, productId, quantity);
}

export async function updateCartItemQuantityForUser(productId: number, quantity: number) {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	console.log("updateCartItemQuantityForUser called for user");
	return await updateCartItemQuantity(user.id, productId, quantity);
}

export async function removeFromCartForUser(productId: number) {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	console.log("removeFromCartForUser called for user");
	return await removeFromCart(user.id, productId);
}

export async function getUserCartForUser() {
	const user = await stackServerApp.getUser();
	if (!user) return [];

	console.log("getUserCartForUser called for user");
	return await getUserCart(user.id);
}

// User-specific Wishlist Actions (with Stack Auth)
export async function addToWishlistForUser(productId: number) {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	console.log("addToWishlistForUser called for user");
	return await addToWishlist(user.id, productId);
}

export async function removeFromWishlistForUser(productId: number) {
	const user = await stackServerApp.getUser();
	if (!user) throw new Error('Not authenticated');

	console.log("removeFromWishlistForUser called for user");
	return await removeFromWishlist(user.id, productId);
}

export async function getUserWishlistForUser() {
	const user = await stackServerApp.getUser();
	if (!user) return [];

	console.log("getUserWishlistForUser called for user");
	return await getUserWishlist(user.id);
}