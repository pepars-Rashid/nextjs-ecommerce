"use server"
import { db } from "@/database/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
	products,
	productImages,
	categories,
	productCategories,
} from "@/database/schema";
import type { Product } from "@/types/product";

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
	const { limit = 12, offset = 0, categoryIds, sort = "latest" } = params;

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