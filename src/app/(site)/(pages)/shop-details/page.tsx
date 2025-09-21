import React from "react";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Details Page | NextCommerce Nextjs E-commerce template",
  description: "This is Shop Details Page for NextCommerce Template",
  // other metadata
};

const ShopDetailsPage = () => {
  // Redirect to first product as default
  redirect("/product/1");
};

export default ShopDetailsPage;
