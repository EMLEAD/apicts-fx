"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Wallet as WalletIcon,
  CreditCard,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Landmark
} from "lucide-react";
import { subscribeToPaymentComplete, PENDING_PURCHASE_KEY } from "@/lib/utils/paymentChannel";

export default function ExchangeTradeModal({
  product,
  tradeType = "buy",
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
  const [sellImages, setSellImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [cardCount, setCardCount] = useState("");
  const [sellFields, setSellFields] = useState({});
  const [bankTransferData, setBankTransferData] = useState(null);
  const [bankTransferProof, setBankTransferProof] = useState(null);
  const [bankTransferProofUrl, setBankTransferProofUrl] = useState("");
  const [bankTransferLoading, setBankTransferLoading] = useState(false);
  const [bankTransferSuccess, setBankTransferSuccess] = useState(false);
  const [bankAccountInfo, setBankAccountInfo] = useState(null);

  const pollIntervalRef = useRef(null);
  const pendingReferenceRef = useRef(null);
  const fileInputRef = useRef(null);

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
      setSellImages([]);
      setCardCount("");
      setSellFields({});
      setBankTransferData(null);
      setBankTransferProof(null);
      setBankTransferProofUrl("");
      setBankTransferLoading(false);
      setBankTransferSuccess(false);
      fetchUserProfile();
      fetch('/api/site-settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings?.bankAccount) {
            const ba = typeof data.settings.bankAccount === 'string'
              ? JSON.parse(data.settings.bankAccount)
              : data.settings.bankAccount;
            setBankAccountInfo(ba);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, product, tradeType, fetchUserProfile]);

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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const newImages = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload/image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (!res.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await res.json();
        newImages.push(data.url);
      }

      setSellImages([...sellImages, ...newImages]);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to upload images. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleBankTransferProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBankTransferLoading(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload/proof-of-payment", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setBankTransferProof(file);
      setBankTransferProofUrl(data.url);
    } catch (err) {
      setErrorMessage("Failed to upload proof image");
    } finally {
      setBankTransferLoading(false);
    }
  };

  const handleBankTransferSubmit = async () => {
    if (!bankTransferData || !bankTransferProofUrl) return;
    setBankTransferLoading(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/payments/direct-transfer/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: bankTransferData.amount,
          purpose: "product_purchase",
          productId: bankTransferData.productId,
          walletId: bankTransferData.walletId,
          quantity: bankTransferData.quantity,
          proofOfPayment: bankTransferProofUrl
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setBankTransferSuccess(true);
      setModalState("success");
      fetchUserProfile();
      onSuccess?.();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setBankTransferLoading(false);
    }
  };

  const removeImage = (index) => {
    setSellImages(sellImages.filter((_, i) => i !== index));
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();

    if (!product || !quantity) {
      setErrorMessage("All fields are required");
      return;
    }

    const qty = Number(quantity);
    if (!qty || Number.isNaN(qty) || qty <= 0) {
      setErrorMessage("Please enter a valid amount greater than zero");
      return;
    }

    if (tradeType === "buy" && !walletId) {
      setErrorMessage("Destination wallet address is required");
      return;
    }

    if (tradeType === "sell") {
      for (const field of sellFormFields) {
        if (!field.required) continue;
        if (field.type === "image") {
          if (sellImages.length === 0) {
            setErrorMessage(`Please upload ${field.label || "images"} of the product you're selling`);
            setModalState("failed");
            return;
          }
        } else {
          const value = String(sellFields[field.key] || "").trim();
          if (!value) {
            setErrorMessage(`Please fill in "${field.label || "this field"}"`);
            setModalState("failed");
            return;
          }
        }
      }
    }

    setErrorMessage("");
    const shouldProcess = tradeType !== "buy" || paymentMethod !== "bank_transfer";
    if (shouldProcess) setModalState("processing");

    const token = localStorage.getItem("token");
    try {
      const endpoint = tradeType === "buy" 
        ? "/api/payments/purchase/initialize" 
        : "/api/payments/sell/initialize";

      const body = tradeType === "buy" 
        ? { productId: product.id, amount: qty, walletId, paymentMethod }
        : (() => {
            const fields = sellFormFields.map((field) => {
              if (field.type === "image") {
                return { key: field.key, label: field.label, type: field.type, value: sellImages };
              }
              return { key: field.key, label: field.label, type: field.type, value: String(sellFields[field.key] || "") };
            });
            const cardField = sellFormFields.find((f) => f.type === "number");
            return {
              productId: product.id,
              amount: qty,
              images: sellImages,
              cardCount: cardField ? Number(sellFields[cardField.key] || 0) : Number(cardCount || 0),
              sellFields: fields
            };
          })();

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Transaction failed to initialize");
        setModalState("failed");
        return;
      }

      if (tradeType === "buy" && data.paymentMethod === "bank_transfer") {
        setBankTransferData(data);
        setModalState("bank_transfer");
        return;
      }

      if (tradeType === "buy" && data.paymentRequired && data.authorizationUrl) {
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

  const rate = tradeType === "buy" 
    ? (Number(product.sellRate) || 0) 
    : (Number(product.buyRate) || 0);

  const sellFormFields = (() => {
    let custom = [];
    if (Array.isArray(product.sellForm)) {
      custom = product.sellForm;
    } else if (typeof product.sellForm === 'string' && product.sellForm) {
      try {
        const parsed = JSON.parse(product.sellForm);
        if (Array.isArray(parsed)) custom = parsed;
      } catch {
        custom = [];
      }
    }
    return custom.length > 0
      ? custom
      : [{ key: "images", label: "Upload Product Images", type: "image", required: true }];
  })();
  const qtyNum = Number(quantity) || 0;
  const calculatedNgn = qtyNum * rate;
  const userBalance = userProfile ? Number(userProfile.walletBalance) || 0 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {tradeType === "buy" ? "Buy" : "Sell"} {product.name}
            </h3>
            <p className="text-xs text-gray-500">
              Rate: NGN {rate}/USD
            </p>
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
                  Quantity ({tradeType === "buy" ? "to Buy" : "to Sell"}) (USD)
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
                  <p className={`mt-1.5 text-xs bg-opacity-50 border rounded-lg p-2 font-medium ${
                    tradeType === "buy" 
                      ? "text-gray-600 bg-red-50 border-red-100" 
                      : "text-green-700 bg-green-50 border-green-100"
                  }`}>
                    {tradeType === "buy" ? "Total Cost" : "You'll Receive"}: <span className={`font-bold ${
                      tradeType === "buy" ? "text-red-600" : "text-green-600"
                    }`}>
                      NGN {calculatedNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                )}
              </div>

              {tradeType === "buy" && (
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
              )}

              {tradeType === "sell" && (
                <>
                  {sellFormFields.map((field) => (
                    <div key={field.key}>
                      {field.type === "image" ? (
                        <>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                            {field.label || "Upload Product Images"}
                            {field.required && <span className="text-red-500"> *</span>}
                          </label>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            {sellImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image}
                                  alt={`Uploaded ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                              <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              {uploadingImages ? (
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                              ) : (
                                <>
                                  <Upload size={24} className="text-gray-400 mb-1" />
                                  <span className="text-xs text-gray-500">Add Image</span>
                                </>
                              )}
                            </label>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Upload clear images of the {product.name} you&apos;re selling
                          </p>
                        </>
                      ) : field.type === "textarea" ? (
                        <>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                            {field.label || "Field"}
                            {field.required && <span className="text-red-500"> *</span>}
                          </label>
                          <textarea
                            rows={3}
                            value={String(sellFields[field.key] || "")}
                            onChange={(e) => setSellFields({ ...sellFields, [field.key]: e.target.value })}
                            placeholder={field.placeholder || ""}
                            className="block w-full px-3.5 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-sm focus:outline-none"
                          />
                        </>
                      ) : (
                        <>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                            {field.label || "Field"}
                            {field.required && <span className="text-red-500"> *</span>}
                          </label>
                          <input
                            type={field.type === "number" ? "number" : "text"}
                            min={field.type === "number" ? "0" : undefined}
                            step={field.type === "number" ? "any" : undefined}
                            value={String(sellFields[field.key] || "")}
                            onChange={(e) => setSellFields({ ...sellFields, [field.key]: e.target.value })}
                            placeholder={field.placeholder || ""}
                            className="block w-full px-3.5 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-sm focus:outline-none"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </>
              )}

              {tradeType === "buy" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "wallet" ? "border-red-600 bg-red-50/40 text-red-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                      <input type="radio" name="paymentMethod" value="wallet" checked={paymentMethod === "wallet"} onChange={() => setPaymentMethod("wallet")} className="sr-only" />
                      <WalletIcon size={20} className="mb-1.5" />
                      <span className="text-xs font-bold">Wallet</span>
                      <span className="text-[10px] opacity-80 mt-1 truncate max-w-full">
                        NGN {userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "card" ? "border-red-600 bg-red-50/40 text-red-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                      <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="sr-only" />
                      <CreditCard size={20} className="mb-1.5" />
                      <span className="text-xs font-bold">Card</span>
                      <span className="text-[10px] opacity-80 mt-1">Via Paystack</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "bank_transfer" ? "border-red-600 bg-red-50/40 text-red-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}>
                      <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} className="sr-only" />
                      <Landmark size={20} className="mb-1.5" />
                      <span className="text-xs font-bold">Transfer</span>
                      <span className="text-[10px] opacity-80 mt-1">Bank transfer</span>
                    </label>
                  </div>
                </div>
              )}

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
                <button type="submit" className={`flex-1 ${
                  tradeType === "buy" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-green-600 hover:bg-green-700"
                } text-white font-bold py-3 rounded-lg text-sm transition-colors`}>
                  {tradeType === "buy" 
                    ? `Pay NGN ${calculatedNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                    : "Submit Sell Request"}
                </button>
              </div>
            </form>
          )}

          {modalState === "bank_transfer" && bankTransferData && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Landmark className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Bank Transfer Payment</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Transfer <span className="font-bold text-gray-900">NGN {bankTransferData.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> for {bankTransferData.quantity} USD of {bankTransferData.productName}
                </p>
              </div>

              {bankAccountInfo && bankAccountInfo.accountNumber ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bank</span>
                    <span className="text-sm font-semibold text-gray-900">{bankAccountInfo.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Number</span>
                    <span className="text-sm font-semibold text-gray-900 font-mono">{bankAccountInfo.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Name</span>
                    <span className="text-sm font-semibold text-gray-900">{bankAccountInfo.accountName}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
                  Bank account details not configured. Please contact support.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Proof of Payment
                </label>
                <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <input type="file" accept="image/*" onChange={handleBankTransferProofUpload} className="hidden" />
                  {bankTransferLoading ? (
                    <Loader2 size={18} className="animate-spin text-gray-400" />
                  ) : bankTransferProof ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <Upload size={18} className="text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {bankTransferProof ? bankTransferProof.name : "Upload screenshot"}
                  </span>
                </label>
                {bankTransferProofUrl && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Image uploaded
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-2 text-xs text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex space-x-3">
                <button type="button" onClick={() => setModalState("input")} className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg text-sm hover:bg-gray-50">
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleBankTransferSubmit}
                  disabled={bankTransferLoading || !bankTransferProofUrl}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bankTransferLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Submitting...
                    </span>
                  ) : "Submit Proof"}
                </button>
              </div>
            </div>
          )}

          {modalState === "processing" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-red-600" />
              <div className="text-center">
                <h4 className="font-bold text-gray-900 text-sm">Processing Transaction</h4>
                {tradeType === "buy" && paymentMethod === "bank_transfer" ? (
                  <p className="text-xs text-gray-500">
                    Submitting your bank transfer proof...
                  </p>
                ) : tradeType === "buy" && paymentMethod === "card" ? (
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
                  <p className="text-xs text-gray-500">
                    {tradeType === "buy" 
                      ? "Deducting wallet balance and recording trade..." 
                      : "Submitting your sell request..."}
                  </p>
                )}
              </div>
            </div>
          )}

          {modalState === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <div>
                <h4 className="font-bold text-gray-900 text-base">
                  {tradeType === "buy" ? "Trade Request Submitted!" : "Sell Request Submitted!"}
                </h4>
                {tradeType === "buy" ? (
                  <>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2">
                      Payment of <span className="font-semibold text-gray-800">NGN {calculatedNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> received.
                    </p>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2">
                      Your trade of <span className="font-semibold">${quantity} USD of {product.name}</span> is in progress and will be sent to:
                    </p>
                    <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg text-xs font-mono text-gray-700 select-all max-w-xs mx-auto mt-2">
                      {walletId}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2">
                      Your sell request for <span className="font-semibold">${quantity} USD of {product.name}</span> has been received.
                    </p>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2">
                      You&apos;ll receive <span className="font-semibold text-green-600">NGN {calculatedNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> once your request is verified.
                    </p>
                  </>
                )}
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
                <h4 className="font-bold text-gray-900 text-base">
                  {tradeType === "buy" ? "Payment Failed" : "Request Failed"}
                </h4>
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
