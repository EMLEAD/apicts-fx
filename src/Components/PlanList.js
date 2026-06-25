"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

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
              {isLoggedIn ? (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                  className="block w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {subscribing === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subscribing...
                    </span>
                  ) : 'Subscribe Now'}
                </button>
              ) : (
                <a
                  href={`/dashboard/subscription?plan=${encodeURIComponent(plan.id)}`}
                  className="block text-center bg-gray-100 hover:bg-red-700 text-black px-4 py-2 rounded-md font-semibold"
                >
                  Choose
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}