"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const formatCurrency = (amount, currency = "NGN") => {
  const numeric = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, minimumFractionDigits: 2 }).format(numeric);
  } catch {
    return `${currency} ${numeric.toFixed(2)}`;
  }
};

export default function PlansList({ limit = 3 }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchPlans = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/plans?status=active");
        if (!res.ok) {
          // fallback: try all plans
          const fallback = await fetch("/api/plans?includeInactive=true");
          if (!fallback.ok) throw new Error("Failed to load plans");
          const fd = await fallback.json();
          if (mounted) setPlans(Array.isArray(fd.plans) ? fd.plans.slice(0, limit) : []);
        } else {
          const data = await res.json();
          if (mounted) setPlans(Array.isArray(data.plans) ? data.plans.slice(0, limit) : []);
        }
      } catch (err) {
        console.error("Plans fetch error:", err);
        if (mounted) setError(err.message || "Unable to load plans");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPlans();
    return () => { mounted = false; };
  }, [limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600 py-4">{error}</div>;
  }

  if (!plans.length) {
    return <div className="text-sm text-gray-600 py-4">No plans available.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 ">
      {plans.map((plan) => (
        <div key={plan.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-600">{plan.name}</h3>
            {plan.metadata?.popular && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Popular</span>}
          </div>

          <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

          <div className="flex items-baseline justify-center mb-4">
            <span className="text-3xl font-bold text-red-600">{formatCurrency(plan.price, plan.currency)}</span>
            <span className="text-sm text-gray-500 ml-2">/month</span>
          </div>

          <div className="space-y-2 mb-4">
            {(plan.features || []).slice(0, 4).map((f, i) => (
              <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-green-600">•</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div>
            <a
              href={`/dashboard/subscription?plan=${encodeURIComponent(plan.id)}`}
              className="block text-center bg-black hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold"
            >
              Choose
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}