"use server"
import type { Product } from "@/types/product";
import { listProducts } from "@/app/action";
import type { ListProductsParams } from "@/app/action";

export async function getShopData(params: ListProductsParams = {}): Promise<Product[]> {
	return await listProducts(params);
}
