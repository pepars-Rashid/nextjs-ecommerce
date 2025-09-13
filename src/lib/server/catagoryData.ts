"use server"
import type { Category } from "@/types/category";
import { listCategoriesWithCounts } from "@/app/actions/action";

export async function getCategoryData(): Promise<Category[]> {
	const rows = await listCategoriesWithCounts();
	return rows.map((r) => ({ 
		id: r.id, 
		title: r.name, 
		img: r.imgUrl 
	}));
}
