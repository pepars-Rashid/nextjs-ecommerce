import React from "react";
import ProductDetails from "@/components/ProductDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Details | NextCommerce Nextjs E-commerce template",
  description: "This is Product Details Page for NextCommerce Template",
  // other metadata
};

const ProductDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: productSlug } = await params;
  return (
    <main>
      <ProductDetails productSlug={productSlug} />
    </main>
  );
};

export default ProductDetailsPage;
