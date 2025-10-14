import { NextResponse } from "next/server";
import { searchProducts } from "@/app/actions/action";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit") || 10);
    const offset = Number(searchParams.get("offset") || 0);

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ products: [] });
    }

    const products = await searchProducts({ query: q, limit, offset });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


