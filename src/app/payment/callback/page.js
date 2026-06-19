"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { notifyPaymentComplete } from "@/lib/utils/paymentChannel";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [status, setStatus] = useState(reference ? "notifying" : "missing");

  useEffect(() => {
    if (!reference) return;

    notifyPaymentComplete(reference, "product_purchase");
    setStatus("notified");

    const notifyInterval = setInterval(() => {
      notifyPaymentComplete(reference, "product_purchase");
    }, 1500);

    const closeTimer = setTimeout(() => {
      clearInterval(notifyInterval);
      window.close();
    }, 6000);

    return () => {
      clearInterval(notifyInterval);
      clearTimeout(closeTimer);
    };
  }, [reference]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8 text-center">
        {!reference && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment reference missing</h1>
            <p className="text-sm text-gray-500">
              Return to the page where you started your payment and check your transaction status.
            </p>
          </>
        )}

        {reference && status === "notifying" && (
          <>
            <Loader2 className="w-14 h-14 text-red-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Confirming payment...</h1>
            <p className="text-sm text-gray-500">Please wait while we notify your original tab.</p>
          </>
        )}

        {reference && (status === "notified" || status === "no-opener") && (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment successful</h1>
            <p className="text-sm text-gray-500 mb-4">
              {status === "notified"
                ? "Your payment was received. This window will close automatically — return to the previous tab to see your trade confirmation."
                : "Your payment was received. Return to the page where you started the payment to see your confirmation."}
            </p>
            {reference && (
              <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded-lg p-2">
                Ref: {reference}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-red-600" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
