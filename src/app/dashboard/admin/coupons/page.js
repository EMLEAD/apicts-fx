'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Percent,
  BadgePercent,
  Loader2,
  Trash2,
  Pencil,
  Users,
  X,
  Calendar
} from 'lucide-react';

const COUPON_TYPES = [
  { label: 'Percentage Discount', value: 'percentage' },
  { label: 'Fixed Amount Discount', value: 'fixed' },
  { label: 'Free Trial / Access', value: 'free_trial' }
];

const COUPON_STATUSES = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Expired', value: 'expired' }
];

const defaultFormState = {
  code: '',
  type: 'percentage',
  value: '0',
  maxRedemptions: '',
  minPurchaseAmount: '',
  currency: 'NGN',
  status: 'draft',
  startsAt: '',
  endsAt: '',
  isStackable: false,
  metadata: {}
};

function formatDateTime(input) {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

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

export default function AdminCouponsPage() {
  const router = useRouter();
  const [userRoleChecked, setUserRoleChecked] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormState);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [redemptionModalOpen, setRedemptionModalOpen] = useState(false);

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

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      if (!headers) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/coupons?includeRedemptions=true', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to fetch coupons');
      }

      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
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
    fetchCoupons();
  }, [fetchCoupons, router]);

  const openCreateForm = () => {
    setEditingCoupon(null);
    setFormData(defaultFormState);
    setFormOpen(true);
  };

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      type: coupon.type || 'percentage',
      value: coupon.value?.toString() || '0',
      maxRedemptions: coupon.maxRedemptions?.toString() || '',
      minPurchaseAmount: coupon.minPurchaseAmount?.toString() || '',
      currency: coupon.currency || 'NGN',
      status: coupon.status || 'draft',
      startsAt: formatDateTime(coupon.startsAt),
      endsAt: formatDateTime(coupon.endsAt),
      isStackable: Boolean(coupon.isStackable),
      metadata: coupon.metadata || {}
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditingCoupon(null);
    setFormData(defaultFormState);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        code: formData.code,
        type: formData.type,
        value: parseFloat(formData.value || '0') || 0,
        maxRedemptions: formData.maxRedemptions ? Number(formData.maxRedemptions) : null,
        minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : null,
        currency: formData.currency || 'NGN',
        status: formData.status,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        isStackable: Boolean(formData.isStackable),
        metadata: formData.metadata
      };

      const method = editingCoupon ? 'PUT' : 'POST';
      const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to save coupon');
      }

      await fetchCoupons();
      closeForm();
    } catch (err) {
      setError(err.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (!couponId || deletingId) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this coupon?');
    if (!confirmDelete) return;

    try {
      setDeletingId(couponId);
      setError(null);

      const headers = getAuthHeaders();
      if (!headers) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to delete coupon');
      }

      await fetchCoupons();
    } catch (err) {
      setError(err.message || 'Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  };

  const openRedemptionModal = (coupon) => {
    setSelectedCoupon(coupon);
    setRedemptionModalOpen(true);
  };

  const closeRedemptionModal = () => {
    setSelectedCoupon(null);
    setRedemptionModalOpen(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Create and manage discount coupons for deposits, subscriptions, or marketing campaigns. You can track
            redemptions and control availability windows.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
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
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <BadgePercent className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No coupons yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Use coupons to reward loyal users or run marketing campaigns. Click below to create your first coupon.
          </p>
          <div className="mt-6">
            <button
              onClick={openCreateForm}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Coupon Code</p>
                  <h3 className="text-lg font-semibold text-gray-900">{coupon.code}</h3>
                  <p className="mt-1 text-sm text-gray-600 capitalize">{coupon.type.replace('_', ' ')}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    coupon.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : coupon.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : coupon.status === 'expired'
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {coupon.status}
                </span>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Value</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {coupon.type === 'percentage'
                        ? `${coupon.value}%`
                        : coupon.type === 'free_trial'
                        ? 'Free Access'
                        : formatCurrency(coupon.value, coupon.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Redemptions</p>
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <Users className="h-4 w-4 mr-1 text-red-500" />
                      {coupon.redemptions?.length || 0}
                      {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ''}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Starts: {coupon.startsAt ? new Date(coupon.startsAt).toLocaleDateString() : 'Anytime'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Ends: {coupon.endsAt ? new Date(coupon.endsAt).toLocaleDateString() : 'No expiry'}
                    </span>
                  </div>
                </div>

                {coupon.minPurchaseAmount ? (
                  <p className="text-xs text-gray-500">
                    Minimum purchase: {formatCurrency(coupon.minPurchaseAmount, coupon.currency)}
                  </p>
                ) : null}

                <p className="text-xs text-gray-500">
                  Stackable: <span className="font-medium">{coupon.isStackable ? 'Yes' : 'No'}</span>
                </p>
              </div>

              <div className="border-t border-gray-100 px-5 py-4 flex flex-wrap gap-2">
                <button
                  onClick={() => openRedemptionModal(coupon)}
                  className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Redemptions
                </button>
                <button
                  onClick={() => openEditForm(coupon)}
                  className="inline-flex items-centered rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  disabled={deletingId === coupon.id}
                  className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === coupon.id ? (
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

      {/* Coupon Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Set the coupon properties below. Time windows and maximum redemptions help control availability.
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleFormChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 uppercase"
                    placeholder="WELCOME10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coupon Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    {COUPON_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Value <span className="text-xs text-gray-500">({formData.type === 'percentage' ? '%' : formData.currency})</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="value"
                    value={formData.value}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Redemptions</label>
                  <input
                    type="number"
                    min="0"
                    name="maxRedemptions"
                    value={formData.maxRedemptions}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Unlimited"
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Purchase Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="minPurchaseAmount"
                    value={formData.minPurchaseAmount}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    {COUPON_STATUSES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Starts At</label>
                  <input
                    type="datetime-local"
                    name="startsAt"
                    value={formData.startsAt}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ends At</label>
                  <input
                    type="datetime-local"
                    name="endsAt"
                    value={formData.endsAt}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="isStackable"
                    checked={formData.isStackable}
                    onChange={handleFormChange}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  Allow stacking with other coupons
                </label>
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
                    editingCoupon ? 'Update Coupon' : 'Create Coupon'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redemptions Modal */}
      {redemptionModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Coupon Redemptions</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedCoupon.code} · {selectedCoupon.redemptions?.length || 0} redemption(s)
                </p>
              </div>
              <button
                onClick={closeRedemptionModal}
                className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6 max-h-[420px] overflow-y-auto">
              {selectedCoupon.redemptions?.length ? (
                <div className="space-y-4">
                  {selectedCoupon.redemptions.map((redemption) => (
                    <div key={redemption.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Redeemed on {new Date(redemption.redeemedAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Status: <span className="font-medium capitalize">{redemption.status}</span>
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-700">
                          {redemption.discountValue ? (
                            <p>Discount: {formatCurrency(redemption.discountValue, selectedCoupon.currency)}</p>
                          ) : null}
                          {redemption.finalAmount ? (
                            <p>Final amount: {formatCurrency(redemption.finalAmount, selectedCoupon.currency)}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-gray-700">No redemptions yet.</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Once users redeem this coupon, the history will appear here.
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
