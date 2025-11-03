'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  X,
  ShieldCheck
} from 'lucide-react';

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
];

const defaultFormState = {
  name: '',
  description: '',
  price: '0',
  currency: 'NGN',
  features: '',
  status: 'draft',
  displayOrder: 0,
  metadata: {},
  referralCommissionRate: '0'
};

function formatCurrency(amount, currency = 'NGN') {
  if (amount === undefined || amount === null) {
    return `${currency} 0.00`;
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (Number.isNaN(numericAmount)) {
    return `${currency} ${amount}`;
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(numericAmount);
}

export default function AdminPlansPage() {
  const router = useRouter();
  const [userRoleChecked, setUserRoleChecked] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormState);
  const [editingPlan, setEditingPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      return null;
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      if (!headers) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/plans?includeSubscriptions=true', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (!['super_admin', 'admin', 'manager', 'support'].includes(parsed.role)) {
          router.push('/dashboard');
          return;
        }
      } catch (err) {
        console.error('Failed to parse stored user', err);
        router.push('/login');
        return;
      }
    }

    setUserRoleChecked(true);
    fetchPlans();
  }, [fetchPlans, router]);

  const openCreateForm = () => {
    setEditingPlan(null);
    setFormData(defaultFormState);
    setFormOpen(true);
  };

  const openEditForm = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price?.toString() || '0',
      currency: plan.currency || 'NGN',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      status: plan.status || 'draft',
      displayOrder: plan.displayOrder ?? 0,
      metadata: plan.metadata || {},
      referralCommissionRate: plan.referralCommissionRate?.toString() || '0'
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditingPlan(null);
    setFormData(defaultFormState);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'displayOrder' ? Number(value) : value
    }));
  };

  const transformFeatures = (value) => {
    if (!value) {
      return [];
    }

    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const headers = getAuthHeaders();
      if (!headers) {
        router.push('/login');
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price || '0') || 0,
        currency: formData.currency || 'NGN',
        features: transformFeatures(formData.features),
        status: formData.status,
        displayOrder: Number.isFinite(formData.displayOrder) ? formData.displayOrder : 0,
        metadata: formData.metadata,
        referralCommissionRate: parseFloat(formData.referralCommissionRate || '0') || 0
      };

      const method = editingPlan ? 'PUT' : 'POST';
      const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : '/api/admin/plans';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to save plan');
      }

      await fetchPlans();
      closeForm();
    } catch (err) {
      setError(err.message || 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!planId || deletingId) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this plan?');
    if (!confirmDelete) return;

    try {
      setDeletingId(planId);
      setError(null);

      const headers = getAuthHeaders();
      if (!headers) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to delete plan');
      }

      await fetchPlans();
    } catch (err) {
      setError(err.message || 'Failed to delete plan');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewSubscriptions = async (plan) => {
    try {
      setSubscriptionsLoading(true);
      setSubscriptionsError(null);

      const headers = getAuthHeaders();
      if (!headers) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/plans/${plan.id}/subscriptions`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to fetch subscribers');
      }

      const data = await response.json();
      setSubscriptionPlan(data.plan);
      setSubscriptionModalOpen(true);
    } catch (err) {
      setSubscriptionsError(err.message || 'Failed to load subscribers');
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const closeSubscriptionModal = () => {
    setSubscriptionModalOpen(false);
    setSubscriptionPlan(null);
    setSubscriptionsError(null);
  };

  if (!userRoleChecked) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Subscription Plans</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Create, update, and organize the plans your users can subscribe to. Use the subscribers view to
            see who is currently enrolled in each plan.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No plans yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Start by creating your first subscription plan. You can set pricing, features, and order.
          </p>
          <div className="mt-6">
            <button
              onClick={openCreateForm}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Display Order #{plan.displayOrder ?? 0}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{plan.description || 'No description provided.'}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    plan.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : plan.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {plan.status}
                </span>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Price</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(plan.price, plan.currency)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Referral commission: {Number(plan.referralCommissionRate || 0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Subscribers</p>
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <Users className="h-4 w-4 mr-1 text-red-500" />
                      {plan.subscriptions?.length || 0}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Features</p>
                  {Array.isArray(plan.features) && plan.features.length > 0 ? (
                    <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                      {plan.features.map((feature, idx) => (
                        <li key={`${plan.id}-feature-${idx}`}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No features listed.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 px-5 py-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewSubscriptions(plan)}
                  className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Subscribers
                </button>
                <button
                  onClick={() => openEditForm(plan)}
                  className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  disabled={deletingId === plan.id}
                  className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === plan.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingPlan ? 'Edit Plan' : 'Create Plan'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingPlan
                    ? 'Update the plan details and save your changes.'
                    : 'Fill out the form below to create a new subscription plan.'}
                </p>
              </div>
              <button
                onClick={closeForm}
                className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. Premium Signals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Brief description of the plan"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="NGN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Referral commission (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="referralCommissionRate"
                    value={formData.referralCommissionRate}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Features <span className="text-xs text-gray-500">(one per line)</span>
                </label>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleFormChange}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder={'Daily FX signals\nWeekly coaching call'}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingPlan ? 'Update Plan' : 'Create Plan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscribers Modal */}
      {subscriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Plan Subscribers</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {subscriptionPlan?.name || 'Plan name'} · {subscriptionPlan?.subscriptions?.length || 0} subscriber(s)
                </p>
              </div>
              <button
                onClick={closeSubscriptionModal}
                className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              {subscriptionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : subscriptionsError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {subscriptionsError}
                </div>
              ) : subscriptionPlan?.subscriptions?.length ? (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                  {subscriptionPlan.subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {subscription.user?.username || 'Unknown user'}
                            </p>
                            <span className="text-xs text-gray-500">
                              {subscription.user?.email || 'N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Status: <span className="font-medium capitalize">{subscription.status}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          {subscription.startedAt && (
                            <p className="text-xs text-gray-500">
                              Started: {new Date(subscription.startedAt).toLocaleDateString()}
                            </p>
                          )}
                          {subscription.expiresAt && (
                            <p className="text-xs text-gray-500">
                              Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-gray-700">No subscribers yet.</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Once users subscribe to this plan, they will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


