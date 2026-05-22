"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";

export default function ProductsSection() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  // Do not render the section if there are no products
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Our Products
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
            >
              {/* Image Area */}
              <div className="h-40 w-full overflow-hidden relative bg-gray-100">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">{product.name}</div>
                )}
                {/* Sleek dark gradient overlay to make text pop */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                <h3 className="absolute bottom-4 left-5 text-lg font-bold text-white tracking-wide z-10">
                  {product.name}
                </h3>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="space-y-3 mb-5 flex-1">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">We Buy At</span>
                    <span className="font-bold text-gray-900 text-sm">NGN{product.buyRate || '-'}/USD</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">We Sell At</span>
                    <span className="font-bold text-gray-900 text-sm">NGN{product.sellRate || '-'}/USD</span>
                  </div>
                </div>

                <button
                  onClick={handleAction}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 text-sm shadow-sm hover:shadow-md"
                >
                  <span>Trade Now</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
