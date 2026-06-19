const CHANNEL_NAME = "paystack_payments";
const STORAGE_KEY = "paystack_payment_complete";

export function notifyPaymentComplete(reference, paymentType = "product_purchase") {
  if (!reference || typeof window === "undefined") return;

  const payload = {
    type: "PAYSTACK_PAYMENT_COMPLETE",
    reference,
    paymentType,
    at: Date.now()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(payload);
    channel.close();
  } catch {
    // BroadcastChannel not supported — localStorage event still works across tabs
  }

  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(payload, window.location.origin);
  }
}

export function subscribeToPaymentComplete(callback) {
  if (typeof window === "undefined") return () => {};

  const handlePayload = (payload) => {
    if (payload?.type === "PAYSTACK_PAYMENT_COMPLETE" && payload.reference) {
      callback(payload);
    }
  };

  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      handlePayload(JSON.parse(event.newValue));
    } catch {
      // ignore malformed payload
    }
  };

  const onMessage = (event) => {
    if (event.origin !== window.location.origin) return;
    handlePayload(event.data);
  };

  let channel;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => handlePayload(event.data);
  } catch {
    channel = null;
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener("message", onMessage);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("message", onMessage);
    if (channel) channel.close();
  };
}

export const PENDING_PURCHASE_KEY = "pending_purchase_reference";
