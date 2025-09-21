"use server"
import type { Product } from "@/types/product";
import { listProducts, countProducts } from "@/app/actions/action";
import type { ListProductsParams } from "@/app/actions/action";
import { normalizeProducts } from "@/utils/productUtils";

export async function getShopData(params: ListProductsParams = {}): Promise<Product[]> {
	const listedProducts = await listProducts(params);
	return normalizeProducts(listedProducts);
}

export async function getProductsCount(params: { categoryIds?: number[] } = {}): Promise<number> {
	return await countProducts(params);
}
