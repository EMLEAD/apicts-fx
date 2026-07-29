"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, AlertCircle, CheckCircle, Landmark, Upload, CreditCard } from "lucide-react";

const formatCurrency = (amount, currency = "NGN") => {
  const numeric = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, minimumFractionDigits: 2 }).format(numeric);
  } catch {
    return `${currency} ${numeric.toFixed(2)}`;
  }
};

const MAX_VERIFICATION_ATTEMPTS = 12;
const VERIFICATION_INTERVAL_MS = 5000;

export default function PlansList({ limit = 20 }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [subscribing, setSubscribing] = useState(null);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(null);
  const [paymentTracking, setPaymentTracking] = useState({
    status: 'idle',
    reference: null,
    attempts: 0,
    error: null
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const paymentPollTimeout = useRef(null);
  const [bankAccountInfo, setBankAccountInfo] = useState(null);
  const [bankTransferPlan, setBankTransferPlan] = useState(null);
  const [bankTransferState, setBankTransferState] = useState({ proofFile: null, proofUrl: '', loading: false, error: null, success: false });
  const [paymentModalPlan, setPaymentModalPlan] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Failed to parse user data', err);
      }
    }
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
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
  }, []);

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
          if (mounted) {
            let p = Array.isArray(fd.plans) ? fd.plans : [];
            setPlans(p.slice(0, limit));
          }
        } else {
          const data = await res.json();
          if (mounted) {
            let p = Array.isArray(data.plans) ? data.plans : [];
            setPlans(p.slice(0, limit));
          }
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

  const pollSubscriptionVerification = useCallback(async (reference, attempt = 0) => {
    if (!reference) return;

    setPaymentTracking({ status: 'waiting', reference, attempts: attempt, error: null });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPaymentTracking({
          status: 'error',
          reference,
          attempts: attempt,
          error: 'You are not authenticated. Please log in again.'
        });
        setSubscriptionError('You are not authenticated. Please log in again.');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      const response = await fetch('/api/plans/subscribe/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reference })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentTracking({ status: 'success', reference, attempts: attempt, error: null });
        setSubscriptionSuccess(`Successfully subscribed to plan!`);

        // Update user data
        const userResponse = await fetch('/api/auth/me', { headers });
        if (userResponse.ok) {
          const profileData = await userResponse.json();
          if (profileData.user) {
            localStorage.setItem('user', JSON.stringify(profileData.user));
            setUser(profileData.user);
          }
        }

        // Dispatch event to notify other pages
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('subscriptionUpdated'));
        }

        if (paymentPollTimeout.current) {
          clearTimeout(paymentPollTimeout.current);
          paymentPollTimeout.current = null;
        }
        return;
      }

      const result = await response.json().catch(() => ({}));
      const errorMessage = result.error || 'Payment verification failed';

      if (attempt + 1 < MAX_VERIFICATION_ATTEMPTS) {
        if (paymentPollTimeout.current) {
          clearTimeout(paymentPollTimeout.current);
        }
        paymentPollTimeout.current = setTimeout(() => {
          pollSubscriptionVerification(reference, attempt + 1);
        }, VERIFICATION_INTERVAL_MS);
        return;
      }

      if (paymentPollTimeout.current) {
        clearTimeout(paymentPollTimeout.current);
      }
      setPaymentTracking({ status: 'error', reference, attempts: attempt, error: errorMessage });
      setSubscriptionError(errorMessage);
      paymentPollTimeout.current = null;
    } catch (error) {
      const message = error.message || 'Verification failed';
      if (attempt + 1 < MAX_VERIFICATION_ATTEMPTS) {
        if (paymentPollTimeout.current) {
          clearTimeout(paymentPollTimeout.current);
        }
        paymentPollTimeout.current = setTimeout(() => {
          pollSubscriptionVerification(reference, attempt + 1);
        }, VERIFICATION_INTERVAL_MS);
      } else {
        if (paymentPollTimeout.current) {
          clearTimeout(paymentPollTimeout.current);
        }
        setPaymentTracking({ status: 'error', reference, attempts: attempt, error: message });
        setSubscriptionError(message);
        paymentPollTimeout.current = null;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (paymentPollTimeout.current) {
        clearTimeout(paymentPollTimeout.current);
      }
    };
  }, []);

  const handleSubscribe = async (planId) => {
    try {
      setSubscribing(planId);
      setSubscriptionError(null);
      setSubscriptionSuccess(null);
      setPaymentTracking({ status: 'idle', reference: null, attempts: 0, error: null });

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You are not authenticated. Please log in again.');
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      const response = await fetch('/api/plans/subscribe/payment', {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `Payment initialization failed (${response.status})`);
      }

      const data = await response.json();
      
      if (data.authorizationUrl) {
        const paymentWindow = window.open(data.authorizationUrl, '_blank', 'width=600,height=600');
        
        setTimeout(() => {
          pollSubscriptionVerification(data.reference);
        }, 3000);
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setSubscriptionError(err.message || 'Failed to initialize subscription payment');
      setPaymentTracking({ status: 'idle', reference: null, attempts: 0, error: null });
      if (paymentPollTimeout.current) {
        clearTimeout(paymentPollTimeout.current);
        paymentPollTimeout.current = null;
      }
    } finally {
      setSubscribing(null);
    }
  };

  const handleBankTransferProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBankTransferState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/upload/proof-of-payment', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setBankTransferState(prev => ({ ...prev, proofUrl: data.url, proofFile: file, loading: false }));
    } catch (err) {
      setBankTransferState(prev => ({ ...prev, error: 'Failed to upload image', loading: false }));
    }
  };

  const handleBankTransferSubscribe = async () => {
    if (!bankTransferPlan || bankTransferState.loading) return;
    try {
      setBankTransferState(prev => ({ ...prev, loading: true, error: null, success: false }));
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      if (!bankTransferState.proofUrl) throw new Error('Upload proof of payment');

      let amount = Number(bankTransferPlan.price);
      if (bankTransferPlan.currency === 'USD') {
        const rateRes = await fetch('/api/exchange-rates/latest?from=USD&to=NGN');
        if (rateRes.ok) {
          const rateData = await rateRes.json();
          if (rateData.rate) amount = Math.round(amount * rateData.rate * 100) / 100;
        }
      }

      const res = await fetch('/api/payments/direct-transfer/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, purpose: 'plan_payment', planId: bankTransferPlan.id, proofOfPayment: bankTransferState.proofUrl })
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to submit');
      }
      setBankTransferState({ proofFile: null, proofUrl: '', loading: false, error: null, success: true });
      setSubscriptionSuccess('Proof submitted! Your subscription will be activated once payment is verified.');
      setBankTransferPlan(null);
    } catch (err) {
      setBankTransferState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };



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
    <div>
      {subscriptionError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{subscriptionError}</span>
          </div>
          <button
            onClick={() => setSubscriptionError(null)}
            className="text-red-700 hover:text-red-900 underline text-xs"
          >
            Close
          </button>
        </div>
      )}

      {subscriptionSuccess && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>{subscriptionSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl p-6 shadow-sm border border-red-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">{plan.name}</h3>
              {plan.metadata?.popular && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Popular</span>}
            </div>

            <div className="flex items-baseline justify-center mb-2">
              <span className="text-3xl font-bold text-red-600">{formatCurrency(plan.price, plan.currency)}</span>
            </div>
            
            <p className="text-sm text-gray-600 text-center mb-4 font-medium">{plan.description}</p>

            <div className="space-y-2 mb-4">
              {(() => {
                try {
                  let features = plan.features;
                  if (typeof features === 'string') {
                    let maxAttempts = 5;
                    while (typeof features === 'string' && maxAttempts > 0) {
                      try {
                        features = JSON.parse(features);
                        maxAttempts--;
                      } catch (e) {
                        break;
                      }
                    }
                  }
                  if (!Array.isArray(features)) {
                    features = [];
                  }
                  const cleanFeatures = features.map(f => {
                    if (typeof f !== 'string') return '';
                    return f
                      .replace(/^\[?"?\\?"?/g, '')
                      .replace(/"?\]?"?\\?"?$/g, '')
                      .replace(/\\"/g, '"')
                      .replace(/^"|"$/g, '')
                      .trim();
                  }).filter(Boolean);
                  
                  return cleanFeatures.slice(0, 10).map((f, i) => (
                    <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-green-600">•</span>
                      <span>{f}</span>
                    </div>
                  ));
                } catch (e) {
                  return null;
                }
              })()}
            </div>

            <div>
              <button
                onClick={() => setPaymentModalPlan(plan)}
                className="block w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
              >
                Pay
              </button>
            </div>
          </div>
        ))}
      </div>

      {paymentModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Subscribe — {paymentModalPlan.name}</h3>
              <button onClick={() => setPaymentModalPlan(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <p className="text-sm text-gray-600">Choose your payment method for <span className="font-bold text-gray-900">{formatCurrency(paymentModalPlan.price, paymentModalPlan.currency)}</span></p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  const plan = paymentModalPlan;
                  setPaymentModalPlan(null);
                  if (!isLoggedIn) {
                    window.location.href = '/login';
                    return;
                  }
                  handleSubscribe(plan.id);
                }}
                disabled={subscribing === paymentModalPlan.id}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Pay with Card</p>
                    <p className="text-sm text-gray-500">Instant activation via Paystack</p>
                  </div>
                </div>
                {subscribing === paymentModalPlan.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                ) : (
                  <span className="text-red-600 font-medium text-sm">Choose &rarr;</span>
                )}
              </button>

              <button
                onClick={() => {
                  const plan = paymentModalPlan;
                  setPaymentModalPlan(null);
                  if (!isLoggedIn) {
                    window.location.href = '/login';
                    return;
                  }
                  setBankTransferPlan(plan);
                  setBankTransferState({ proofFile: null, proofUrl: '', loading: false, error: null, success: false });
                }}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Landmark className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Bank Transfer</p>
                    <p className="text-sm text-gray-500">Pay via direct bank transfer</p>
                  </div>
                </div>
                <span className="text-red-600 font-medium text-sm">Choose &rarr;</span>
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Your subscription will be activated immediately after payment confirmation.
            </p>
          </div>
        </div>
      )}

      {bankTransferPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Bank Transfer — {bankTransferPlan.name}</h3>
              <button onClick={() => setBankTransferPlan(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <p className="text-sm text-gray-600">Transfer <span className="font-bold text-gray-900">{formatCurrency(bankTransferPlan.price, bankTransferPlan.currency)}</span> to the account below, then upload your proof of payment.</p>

            {bankAccountInfo && bankAccountInfo.accountNumber ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between"><span className="text-sm text-gray-600">Bank</span><span className="text-sm font-semibold text-gray-900">{bankAccountInfo.bankName}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">Account Number</span><span className="text-sm font-semibold text-gray-900 font-mono">{bankAccountInfo.accountNumber}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">Account Name</span><span className="text-sm font-semibold text-gray-900">{bankAccountInfo.accountName}</span></div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">Bank account details not configured. Please contact support.</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Payment</label>
              <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                <input type="file" accept="image/*" onChange={handleBankTransferProofUpload} className="hidden" />
                {bankTransferState.loading ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <Upload size={18} className="text-gray-400" />}
                <span className="text-sm text-gray-600">{bankTransferState.proofFile ? bankTransferState.proofFile.name : 'Upload screenshot'}</span>
              </label>
              {bankTransferState.proofUrl && <p className="text-xs text-green-600 mt-1">Image uploaded</p>}
            </div>

            {bankTransferState.error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{bankTransferState.error}</div>}
            {bankTransferState.success && <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">Proof submitted! Awaiting admin verification.</div>}

            <div className="flex gap-3">
              <button onClick={() => setBankTransferPlan(null)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleBankTransferSubscribe} disabled={bankTransferState.loading || !bankTransferState.proofUrl} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {bankTransferState.loading ? 'Submitting...' : 'Submit Proof'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}