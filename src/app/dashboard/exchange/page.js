"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  RotateCcw
} from "lucide-react";
import ProductTradeGrid from "@/Components/ProductTradeGrid";
import {
  getTransactionDisplayStatus,
  getPaystackReference,
  parseTransactionMetadata,
  STATUS_TONE_CLASSES
} from "@/lib/utils/transactionStatus";

const formatCurrency = (amount, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency, minimumFractionDigits: 2 }).format(Number(amount) || 0);

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const getAuthHeaders = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
};

const STATUS_ICONS = {
  completed: CheckCircle,
  failed: AlertCircle,
  in_progress: TrendingUp,
  pending_payment: Clock,
  pending: Clock,
  refunded: RotateCcw
};

export default function ExchangePage() {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchExchanges = useCallback(async () => {
    try {
      setError(null);
      const headers = getAuthHeaders();
      if (!headers) {
        setError("You are not authenticated. Please log in again.");
        return;
      }

      const response = await fetch("/api/payments/transactions?type=exchange&limit=50", { headers });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Failed to fetch exchanges");
      }

      const data = await response.json();
      setExchanges(data.transactions || []);
    } catch (err) {
      setError(err.message || "Failed to load exchanges");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchExchanges();
  };

  const filteredExchanges = exchanges.filter((tx) => {
    if (statusFilter === "all") return true;
    const display = getTransactionDisplayStatus(tx);
    return display.key === statusFilter;
  });

  const stats = {
    total: exchanges.length,
    inProgress: exchanges.filter((t) => getTransactionDisplayStatus(t).key === "in_progress").length,
    completed: exchanges.filter((t) => getTransactionDisplayStatus(t).key === "completed").length,
    awaiting: exchanges.filter((t) => getTransactionDisplayStatus(t).key === "pending_payment").length
  };

  return (
    <div>
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-gray-900">Exchange</h1>
        <p className="text-gray-600 mt-2">Buy crypto and e-currencies, track your orders, and manage exchanges.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats.total, color: "text-gray-900" },
          { label: "In Progress", value: stats.inProgress, color: "text-blue-600" },
          { label: "Completed", value: stats.completed, color: "text-green-600" },
          { label: "Awaiting Payment", value: stats.awaiting, color: "text-yellow-600" }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <ProductTradeGrid
          showSectionHeader
          requireAuth
          loginRedirect="/dashboard/exchange"
          onTradeSuccess={fetchExchanges}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Exchanges</h2>
            <p className="text-sm text-gray-500 mt-1">Track payment and fulfillment status for your orders.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="pending_payment">Awaiting Payment</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-3" />
              <p className="text-gray-500 text-sm">Loading exchanges...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-8 w-8 text-red-600 mb-3" />
              <p className="text-red-600 text-sm">{error}</p>
              <button type="button" onClick={handleRefresh} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
                Try Again
              </button>
            </div>
          ) : filteredExchanges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="h-8 w-8 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No exchange orders found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExchanges.map((tx) => {
                  const meta = parseTransactionMetadata(tx.metadata);
                  const display = getTransactionDisplayStatus(tx);
                  const StatusIcon = STATUS_ICONS[display.key] || Clock;
                  const paymentLabel = meta.paymentStatus === "paid" ? "Paid" : meta.paymentStatus === "unpaid" ? "Unpaid" : "—";

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{meta.productName || tx.targetCurrency || "Exchange"}</div>
                        <div className="text-xs text-gray-500 font-mono truncate max-w-[180px]" title={meta.walletId}>
                          {meta.walletId || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {meta.quantity ? `$${meta.quantity} USD` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_TONE_CLASSES[display.tone]}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {display.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${meta.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                          {paymentLabel}
                        </span>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {getPaystackReference(tx) || (meta.paymentMethod === "wallet" ? "Wallet" : "—")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
