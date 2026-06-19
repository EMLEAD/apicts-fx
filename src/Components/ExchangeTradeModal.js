"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Wallet as WalletIcon,
  CreditCard,
  ExternalLink
} from "lucide-react";
import { subscribeToPaymentComplete, PENDING_PURCHASE_KEY } from "@/lib/utils/paymentChannel";

export default function ExchangeTradeModal({
  product,
  isOpen,
  onClose,
  onSuccess
}) {
  const [quantity, setQuantity] = useState("");
  const [walletId, setWalletId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [modalState, setModalState] = useState("input");
  const [errorMessage, setErrorMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [paystackAuthUrl, setPaystackAuthUrl] = useState("");
  const [pollAttempt, setPollAttempt] = useState(0);

  const pollIntervalRef = useRef(null);
  const pendingReferenceRef = useRef(null);

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUserProfile(data.user);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const verifyPayment = useCallback(async (reference) => {
    const token = localStorage.getItem("token");
    if (!token) return "unauthorized";

    try {
      const res = await fetch("/api/payments/purchase/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reference })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        stopPolling();
        sessionStorage.removeItem(PENDING_PURCHASE_KEY);
        setModalState("success");
        fetchUserProfile();
        onSuccess?.();
        return "success";
      }

      if (data.final) {
        stopPolling();
        sessionStorage.removeItem(PENDING_PURCHASE_KEY);
        setErrorMessage(data.error || "Payment was declined or cancelled.");
        setModalState("failed");
        return "failed";
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
    }

    return "pending";
  }, [stopPolling, fetchUserProfile, onSuccess]);

  const startPolling = useCallback((reference) => {
    stopPolling();
    pendingReferenceRef.current = reference;

    const MAX_ATTEMPTS = 60;

    const poll = async (attempt = 1) => {
      setPollAttempt(attempt);
      const result = await verifyPayment(reference);

      if (result === "success" || result === "failed" || result === "unauthorized") {
        if (result === "unauthorized") {
          setErrorMessage("Your session expired. Please log in again.");
          setModalState("failed");
        }
        return;
      }

      if (attempt >= MAX_ATTEMPTS) {
        stopPolling();
        setErrorMessage(
          "Payment verification is taking longer than expected. If you were debited, contact support with Reference: " + reference
        );
        setModalState("failed");
        return;
      }

      pollIntervalRef.current = setTimeout(() => poll(attempt + 1), 3000);
    };

    poll();
  }, [stopPolling, verifyPayment]);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity("");
      setWalletId("");
      setPaymentMethod("wallet");
      setModalState("input");
      setErrorMessage("");
      setPaystackAuthUrl("");
      setPollAttempt(0);
      fetchUserProfile();
    }
  }, [isOpen, product, fetchUserProfile]);

  useEffect(() => {
    return subscribeToPaymentComplete((payload) => {
      const activeReference = pendingReferenceRef.current;
      if (!activeReference || payload.reference !== activeReference) return;
      verifyPayment(payload.reference);
    });
  }, [verifyPayment]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleClose = () => {
    stopPolling();
    sessionStorage.removeItem(PENDING_PURCHASE_KEY);
    pendingReferenceRef.current = null;
    onClose();
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!product || !quantity || !walletId) {
      setErrorMessage("All fields are required");
      return;
    }

    const qty = Number(quantity);
    if (!qty || Number.isNaN(qty) || qty <= 0) {
      setErrorMessage("Please enter a valid amount greater than zero");
      return;
    }

    setErrorMessage("");
    setModalState("processing");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/payments/purchase/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          amount: qty,
          walletId,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Transaction failed to initialize");
        setModalState("failed");
        return;
      }

      if (data.paymentRequired && data.authorizationUrl) {
        setPaystackAuthUrl(data.authorizationUrl);
        pendingReferenceRef.current = data.reference;
        sessionStorage.setItem(PENDING_PURCHASE_KEY, data.reference);
        window.open(data.authorizationUrl, "_blank");
        startPolling(data.reference);
      } else {
        setModalState("success");
        fetchUserProfile();
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred during transaction setup.");
      setModalState("failed");
    }
  };

  if (!isOpen || !product) return null;

  const sellRate = Number(product.sellRate) || 0;
  const qtyNum = Number(quantity) || 0;
  const calculatedNgn = qtyNum * sellRate;
  const userBalance = userProfile ? Number(userProfile.walletBalance) || 0 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Trade: {product.name}</h3>
            <p className="text-xs text-gray-500">Rate: NGN {product.sellRate}/USD</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {modalState === "input" && (
            <form onSubmit={handlePurchaseSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Quantity to Buy (USD)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    className="block w-full pl-8 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-sm focus:outline-none"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 text-xs font-bold">USD</span>
                </div>
                {qtyNum > 0 && (
                  <p className="mt-1.5 text-xs text-gray-600 bg-red-50/50 border border-red-100/50 rounded-lg p-2 font-medium">
                    Total Cost: <span className="text-red-600 font-bold">NGN {calculatedNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Destination Wallet Address / ID
                </label>
                <input
                  type="text"
                  required
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  placeholder={`Enter your ${product.name} address`}
                  className="block w-full px-3.5 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-sm focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  Double check this address. Transfers to an incorrect address cannot be reversed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "wallet" ? "border-red-600 bg-red-50/40 text-red-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                    <input type="radio" name="paymentMethod" value="wallet" checked={paymentMethod === "wallet"} onChange={() => setPaymentMethod("wallet")} className="sr-only" />
                    <WalletIcon size={22} className="mb-2" />
                    <span className="text-xs font-bold">Wallet Balance</span>
                    <span className="text-[10px] opacity-80 mt-1 truncate max-w-full">
                      NGN {userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </label>
                  <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "card" ? "border-red-600 bg-red-50/40 text-red-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                    <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="sr-only" />
                    <CreditCard size={22} className="mb-2" />
                    <span className="text-xs font-bold">Debit / Card</span>
                    <span className="text-[10px] opacity-80 mt-1">Via Paystack</span>
                  </label>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-2 text-xs text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={handleClose} className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-sm">
                  Pay NGN {calculatedNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
              </div>
            </form>
          )}

          {modalState === "processing" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-red-600" />
              <div className="text-center">
                <h4 className="font-bold text-gray-900 text-sm">Processing Transaction</h4>
                {paymentMethod === "card" ? (
                  <div className="space-y-3 mt-1.5">
                    <p className="text-xs text-gray-500">Complete payment in the Paystack tab. This page will update automatically.</p>
                    {paystackAuthUrl && (
                      <div className="flex flex-col items-center space-y-2 pt-2">
                        <a href={paystackAuthUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1.5 text-xs text-red-600 font-bold hover:underline">
                          <span>Open Paystack checkout</span>
                          <ExternalLink size={12} />
                        </a>
                        <p className="text-[10px] text-gray-400">Awaiting confirmation... (Attempt {pollAttempt}/60)</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Deducting wallet balance and recording trade...</p>
                )}
              </div>
            </div>
          )}

          {modalState === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <div>
                <h4 className="font-bold text-gray-900 text-base">Trade Request Submitted!</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2">
                  Payment of <span className="font-semibold text-gray-800">NGN {calculatedNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> received.
                </p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2">
                  Your trade of <span className="font-semibold">${quantity} USD of {product.name}</span> is in progress and will be sent to:
                </p>
                <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg text-xs font-mono text-gray-700 select-all max-w-xs mx-auto mt-2">
                  {walletId}
                </div>
              </div>
              <button type="button" onClick={handleClose} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg text-sm mt-4">
                Done
              </button>
            </div>
          )}

          {modalState === "failed" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <AlertCircle className="w-14 h-14 text-red-500" />
              <div>
                <h4 className="font-bold text-gray-900 text-base">Payment Failed</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2">{errorMessage || "An unexpected error occurred."}</p>
              </div>
              <div className="flex w-full space-x-3 pt-2">
                <button type="button" onClick={() => setModalState("input")} className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg text-sm hover:bg-gray-50">
                  Try Again
                </button>
                <button type="button" onClick={handleClose} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg text-sm">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
