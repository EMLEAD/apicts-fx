'use client';

import { useState, useEffect } from 'react';
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  TrendingUp,
  Users,
  BarChart3,
  Clock,
  CreditCard,
  Calendar,
  Download
} from 'lucide-react';

export default function SubscriptionPage() {
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('premium');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      period: 'month',
      description: 'Perfect for getting started',
      features: [
        'Basic market analysis',
        'Standard exchange rates',
        'Email support',
        'Mobile app access',
        'Basic trading tools'
      ],
      limitations: [
        'Limited to 5 transactions per day',
        'No priority support',
        'Basic analytics only'
      ],
      popular: false,
      color: 'gray'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 43500,
      period: 'month',
      description: 'Most popular for active traders',
      features: [
        'Advanced market analysis',
        'Real-time exchange rates',
        'Priority support',
        'Advanced trading tools',
        'Detailed analytics',
        'Custom alerts',
        'API access',
        'Webinar access'
      ],
      limitations: [],
      popular: true,
      color: 'red'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 148500,
      period: 'month',
      description: 'For professional traders and institutions',
      features: [
        'Everything in Premium',
        'Dedicated account manager',
        'Custom integrations',
        'White-label solutions',
        'Advanced risk management',
        '24/7 phone support',
        'Custom reporting',
        'Training sessions'
      ],
      limitations: [],
      popular: false,
      color: 'purple'
    }
  ];

  const currentPlan = {
    name: 'Premium',
    status: 'active',
    nextBilling: '2025-11-10',
    amount: 43500,
    features: [
      'Advanced market analysis',
      'Real-time exchange rates',
      'Priority support',
      'Advanced trading tools'
    ]
  };

  const billingHistory = [
    {
      id: 1,
      date: '2025-11-10',
      amount: 43500,
      status: 'paid',
      description: 'Premium Plan - Monthly'
    },
    {
      id: 2,
      date: '2024-11-10',
      amount: 43500,
      status: 'paid',
      description: 'Premium Plan - Monthly'
    },
    {
      id: 3,
      date: '2024-10-15',
      amount: 43500,
      status: 'paid',
      description: 'Premium Plan - Monthly'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 pt-10">Subscription & Billing</h1>
        <p className="text-gray-600 mt-2">Manage your subscription plan and billing information.</p>
      </div>

      {/* Current Plan */}
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
            <p className="text-lg font-semibold text-gray-900">{currentPlan.nextBilling}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Amount</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">₦{currentPlan.amount}/month</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Status</span>
            </div>
            <p className="text-lg font-semibold text-green-600 capitalize">{currentPlan.status}</p>
          </div>
        </div>

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

        <div className="flex items-center space-x-4 mt-6">
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Manage Subscription
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Download Invoice
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl shadow-sm border-2 transition-all ${
                plan.popular 
                  ? 'border-red-500 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
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
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">₦{plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Limitations</h4>
                    <div className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {plan.id === 'basic' ? 'Current Plan' : 'Upgrade Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
          <p className="text-gray-600 text-sm mt-1">Your recent billing transactions</p>
        </div>
        
        <div className="overflow-x-auto">
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
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{item.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
        </div>
      </div>
    </div>
  );
}
