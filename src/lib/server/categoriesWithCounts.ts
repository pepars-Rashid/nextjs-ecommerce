"use server"
import { listCategoriesWithCounts } from "@/app/actions/action";

export type SidebarCategory = {
	id: number;
	name: string;
	products: number;
};

export async function getCategoriesWithCounts(): Promise<SidebarCategory[]> {
	const rows = await listCategoriesWithCounts();
	return rows.map((r) => ({
		id: r.id,
		name: r.name,
		products: Number(r.productCount ?? 0),
	}));
} 