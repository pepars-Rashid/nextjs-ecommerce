import React from "react";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop by Category | NextCommerce",
};

const CategoryShopPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return (
    <main>
      <ShopWithoutSidebar categorySlug={slug} />
    </main>
  );
};

export default CategoryShopPage;


