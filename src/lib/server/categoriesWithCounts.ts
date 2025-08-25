"use server"
import { listCategoriesWithCounts } from "@/app/action";

export type SidebarCategory = {
	name: string;
	products: number;
};

export async function getCategoriesWithCounts(): Promise<SidebarCategory[]> {
	const rows = await listCategoriesWithCounts();
	return rows.map((r) => ({
		name: r.name,
		products: Number(r.productCount ?? 0),
	}));
} 