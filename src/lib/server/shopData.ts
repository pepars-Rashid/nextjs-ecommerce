"use server"
import type { Product } from "@/types/product";
import { listProducts, countProducts } from "@/app/actions/action";
import type { ListProductsParams } from "@/app/actions/action";

export async function getShopData(params: ListProductsParams = {}): Promise<Product[]> {
	return await listProducts(params);
}

export async function getProductsCount(params: { categoryIds?: number[] } = {}): Promise<number> {
	return await countProducts(params);
}
