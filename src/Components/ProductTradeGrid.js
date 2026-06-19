"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import ExchangeTradeModal from "@/Components/ExchangeTradeModal";

export default function ProductTradeGrid({
  showSectionHeader = true,
  requireAuth = false,
  loginRedirect = "/",
  onTradeSuccess,
  className = ""
}) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

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

  const handleTrade = (product) => {
    if (requireAuth) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push(`/login?redirect=${encodeURIComponent(loginRedirect)}`);
        return;
      }
    }

    setSelectedProduct(product);
    setShowTradeModal(true);
  };

  const handleCloseModal = () => {
    setShowTradeModal(false);
    setSelectedProduct(null);
  };

  const handleSuccess = () => {
    onTradeSuccess?.();
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-48 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <div className={className}>
        {showSectionHeader && (
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              Available Products
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto rounded-full" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="h-36 w-full overflow-hidden relative bg-gray-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                    {product.name}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                <h3 className="absolute bottom-3 left-4 text-lg font-bold text-white tracking-wide z-10">
                  {product.name}
                </h3>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">We Buy At</span>
                    <span className="font-bold text-gray-900 text-sm">NGN{product.buyRate || "-"}/USD</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">We Sell At</span>
                    <span className="font-bold text-gray-900 text-sm">NGN{product.sellRate || "-"}/USD</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTrade(product)}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
                >
                  <span>Trade Now</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ExchangeTradeModal
        product={selectedProduct}
        isOpen={showTradeModal}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </>
  );
}
