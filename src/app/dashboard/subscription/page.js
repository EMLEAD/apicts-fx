'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Check, 
  Crown, 
  Star, 
  Shield, 
  CreditCard,
  Calendar,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Landmark,
  Upload
} from 'lucide-react';

const formatCurrency = (amount, currency = 'NGN') => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(numericAmount);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-NG', { 
    dateStyle: 'medium'
  }).format(date);
};

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export default function SubscriptionPage() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paymentTracking, setPaymentTracking] = useState({
    status: 'idle',
    reference: null,
    attempts: 0,
    error: null
  });
  const paymentPollTimeout = useRef(null);
  const [bankAccountInfo, setBankAccountInfo] = useState(null);
  const [bankTransferPlan, setBankTransferPlan] = useState(null);
  const [bankTransferState, setBankTransferState] = useState({ proofFile: null, proofUrl: '', loading: false, error: null, success: false });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Failed to parse user data', err);
      }
    }
    // Fetch bank account for direct transfers
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

  const fetchPlans = useCallback(async () => {
    try {
      // Try fetching active plans first
      let response = await fetch('/api/plans?status=active');
      
      // If no active plans, try fetching all plans
      if (!response.ok) {
        response = await fetch('/api/plans?includeInactive=true');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch plans');
      }
      
      const data = await response.json();
      console.log('Fetched plans:', data);
      
      if (data.success && Array.isArray(data.plans)) {
        // Parse features for each plan
        const parsedPlans = data.plans.map(plan => {
          if (plan.features) {
            try {
              let features = plan.features;
              // Handle multi-encoded JSON
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
              // Ensure it's an array
              if (!Array.isArray(features)) {
                features = [];
              }
              // Clean each feature string - remove brackets, quotes, escape chars
              plan.features = features.map(f => {
                if (typeof f !== 'string') return '';
                return f
                  .replace(/^\[?"?\\?"?/g, '')
                  .replace(/"?\]?"?\\?"?$/g, '')
                  .replace(/\\"/g, '"')
                  .replace(/^"|"$/g, '')
                  .trim();
              }).filter(Boolean);
            } catch (e) {
              console.error('Failed to parse plan features:', e);
              plan.features = [];
            }
          }
          return plan;
        });
        
        // Filter to only show active plans on the frontend
        const activePlans = parsedPlans.filter(plan => plan.status === 'active');
        setPlans(activePlans);
        
        if (activePlans.length === 0) {
          console.warn('No active plans found');
        }
      } else {
        console.warn('Unexpected response format:', data);
        setPlans([]);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err.message || 'Failed to load plans. Please try again later.');
      setPlans([]);
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch('/api/plans/user-subscription', {
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          return;
        }
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      
      // Parse features if it's a JSON string
      if (data.subscription?.plan?.features) {
        try {
          let features = data.subscription.plan.features;
          // Handle multi-encoded JSON
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
          // Ensure it's an array
          if (!Array.isArray(features)) {
            features = [];
          }
          // Clean each feature string - remove brackets, quotes, escape chars
          data.subscription.plan.features = features.map(f => {
            if (typeof f !== 'string') return '';
            return f
              .replace(/^\[?"?\\?"?/g, '')
              .replace(/"?\]?"?\\?"?$/g, '')
              .replace(/\\"/g, '"')
              .replace(/^"|"$/g, '')
              .trim();
          }).filter(Boolean);
        } catch (e) {
          console.error('Failed to parse plan features:', e);
          data.subscription.plan.features = [];
        }
      }
      
      setCurrentSubscription(data.subscription);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  }, []);

  const fetchBillingHistory = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch('/api/payments/transactions?limit=100', {
        headers
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      // Filter for subscription-related transactions
      const subscriptionTransactions = (data.transactions || []).filter(t => 
        t.metadata?.subscriptionPayment === true || 
        t.metadata?.planId || 
        (t.description && (t.description.toLowerCase().includes('subscription') || t.description.toLowerCase().includes('plan')))
      );
      setBillingHistory(subscriptionTransactions);
    } catch (err) {
      console.error('Error fetching billing history:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchPlans(), fetchSubscription(), fetchBillingHistory()]);
      } catch (err) {
        console.error('Error loading subscription data:', err);
        setError('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user, fetchPlans, fetchSubscription, fetchBillingHistory]);

  const MAX_VERIFICATION_ATTEMPTS = 12;
  const VERIFICATION_INTERVAL_MS = 5000;

  const pollSubscriptionVerification = useCallback(async (reference, attempt = 0) => {
    if (!reference) return;

    setPaymentTracking({ status: 'waiting', reference, attempts: attempt, error: null });

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setPaymentTracking({
          status: 'error',
          reference,
          attempts: attempt,
          error: 'You are not authenticated. Please log in again.'
        });
        setError('You are not authenticated. Please log in again.');
        return;
      }

      const response = await fetch('/api/plans/subscribe/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reference })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentTracking({ status: 'success', reference, attempts: attempt, error: null });
        setSuccess(`Successfully subscribed to plan!`);
        
        // Refresh subscription and billing history
        await Promise.all([fetchSubscription(), fetchBillingHistory()]);
        
        // Update user wallet balance
        const userResponse = await fetch('/api/auth/me', { headers });
        if (userResponse.ok) {
          const profileData = await userResponse.json();
          if (profileData.user) {
            localStorage.setItem('user', JSON.stringify(profileData.user));
            setUser(profileData.user);
          }
        }

        // Dispatch event to notify other pages (like videos) that subscription was updated
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
      setError(errorMessage);
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
        setError(message);
        paymentPollTimeout.current = null;
      }
    }
  }, [fetchSubscription, fetchBillingHistory]);

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
      setError(null);
      setSuccess(null);
      setPaymentTracking({ status: 'idle', reference: null, attempts: 0, error: null });

      // Check for token
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        throw new Error('You are not authenticated. Please log in again.');
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      // Initialize payment
      const response = await fetch('/api/plans/subscribe/payment', {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        console.error('Payment API error:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error,
          details: result
        });
        throw new Error(result.error || `Payment initialization failed (${response.status})`);
      }

      const data = await response.json();
      
      // Open Paystack payment window
      if (data.authorizationUrl) {
        const paymentWindow = window.open(data.authorizationUrl, '_blank', 'width=600,height=600');
        
        // Poll for verification after a short delay
        setTimeout(() => {
          pollSubscriptionVerification(data.reference);
        }, 3000);
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to initialize subscription payment');
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
      setSuccess('Proof submitted! Your subscription will be activated once payment is verified.');
      setBankTransferPlan(null);
      fetchBillingHistory();
    } catch (err) {
      setBankTransferState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const isSubscribedToPlan = (planId) => {
    return currentSubscription?.planId === planId && currentSubscription?.status === 'active';
  };

  const getNextBillingDate = () => {
    if (!currentSubscription?.startedAt) return null;
    const startDate = new Date(currentSubscription.startedAt);
    const nextBilling = new Date(startDate);
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    return nextBilling;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const currentPlan = currentSubscription?.plan;
  const nextBilling = getNextBillingDate();

  return (
    <div>
      {/* Header */}
      <div className="mb-8 ">
        <h1 className="text-3xl font-bold text-gray-900 pt-10">Subscription & Billing</h1>
        <p className="text-gray-600 mt-2">Manage your subscription plan and billing information.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => {
              setError(null);
              fetchPlans();
            }}
            className="text-red-700 hover:text-red-900 underline text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Current Plan */}
      {currentSubscription && currentPlan && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
              <p className="text-gray-600">Your active subscription details</p>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">{currentPlan.name}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Next Billing</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {nextBilling ? formatDate(nextBilling) : '—'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Amount</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(currentPlan.price, currentPlan.currency)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Status</span>
              </div>
              <p className="text-lg font-semibold text-green-600 capitalize">{currentSubscription.status}</p>
            </div>
          </div>

          {currentPlan.features && currentPlan.features.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Included Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 mt-6">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Manage Subscription
            </button>
            {/* <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Download Invoice
            </button> */}
          </div>
        </div>
      )}

      {!currentSubscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">No Active Subscription</h3>
              <p className="text-sm text-blue-700 mt-1">Subscribe to a plan below to get started.</p>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Signal Plans</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No plans available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSubscribed = isSubscribedToPlan(plan.id);
              const isPopular = plan.displayOrder === 1 || (plan.metadata?.popular === true);
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl shadow-sm border-2 transition-all ${
                    isSubscribed
                      ? 'border-green-500 shadow-lg'
                      : isPopular
                      ? 'border-red-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isSubscribed && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Current Plan</span>
                      </div>
                    </div>
                  )}
                  
                  {!isSubscribed && isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                      )}
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatCurrency(plan.price, plan.currency)}
                        </span>
                        <span className="text-gray-600 ml-1">/month</span>
                      </div>
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isSubscribed || subscribing === plan.id}
                      className={`w-full py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        isSubscribed
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : isPopular
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {subscribing === plan.id ? (
                        <span className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Subscribing...</span>
                        </span>
                      ) : isSubscribed ? (
                        'Current Plan'
                      ) : (
                        'Pay with Card'
                      )}
                    </button>
                    {!isSubscribed && (
                      <button
                        onClick={() => { setBankTransferPlan(plan); setBankTransferState({ proofFile: null, proofUrl: '', loading: false, error: null, success: false }); }}
                        className="w-full mt-2 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Landmark size={16} />
                        Pay via Bank Transfer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
          <p className="text-gray-600 text-sm mt-1">Your recent billing transactions</p>
        </div>
        
        <div className="overflow-x-auto">
          {billingHistory.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No billing history available.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {billingHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description || 'Subscription payment'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.amount, item.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Bank Transfer Modal */}
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
