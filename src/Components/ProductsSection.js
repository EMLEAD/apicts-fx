"use client";

import ProductTradeGrid from "@/Components/ProductTradeGrid";

export default function ProductsSection() {
  return (
    <section className="py-20 bg-gray-50 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Our Products
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
        </div>

        <ProductTradeGrid
          showSectionHeader={false}
          requireAuth
          loginRedirect="/"
        />
      </div>
    </section>
  );
}
