'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Edit, Trash2 } from 'lucide-react';

export default function RateManagement() {
  const [rates, setRates] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    fromCurrency: '',
    toCurrency: '',
    rate: '',
    isActive: true
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/rates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRates(data.rates || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingRate 
        ? `/api/admin/rates/${editingRate.id}`
        : '/api/admin/rates';
      const method = editingRate ? 'PATCH' : 'POST';

      await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      setShowAddModal(false);
      setEditingRate(null);
      setFormData({ fromCurrency: '', toCurrency: '', rate: '', isActive: true });
      fetchRates();
    } catch (error) {
      console.error('Error saving rate:', error);
    }
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: rate.rate,
      isActive: rate.isActive
    });
    setShowAddModal(true);
  };

  const handleDelete = async (rateId) => {
    if (!confirm('Are you sure you want to delete this rate?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/rates/${rateId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchRates();
    } catch (error) {
      console.error('Error deleting rate:', error);
    }
  };

  const toggleRateStatus = async (rateId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/rates/${rateId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !isActive })
      });
      fetchRates();
    } catch (error) {
      console.error('Error updating rate:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rate Management</h1>
          <p className="text-gray-600 mt-2">Manage exchange rates dynamically</p>
        </div>
        <button
          onClick={() => {
            setEditingRate(null);
            setFormData({ fromCurrency: '', toCurrency: '', rate: '', isActive: true });
            setShowAddModal(true);
          }}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Rate</span>
        </button>
      </div>

      {/* Rates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rates.map((rate) => (
          <div key={rate.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {rate.fromCurrency} → {rate.toCurrency}
                  </h3>
                  <p className="text-sm text-gray-500">Exchange Rate</p>
                </div>
              </div>
              <button
                onClick={() => toggleRateStatus(rate.id, rate.isActive)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  rate.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {rate.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>

            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">{parseFloat(rate.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Last updated</span>
              <span>{new Date(rate.updatedAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleEdit(rate)}
                className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(rate.id)}
                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {rates.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <p className="text-gray-500">No exchange rates found. Add your first rate to get started.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingRate ? 'Edit' : 'Add'} Exchange Rate
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Currency
                </label>
                <input
                  type="text"
                  value={formData.fromCurrency}
                  onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                  placeholder="e.g., USD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Currency
                </label>
                <input
                  type="text"
                  value={formData.toCurrency}
                  onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                  placeholder="e.g., NGN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                  placeholder="Enter exchange rate"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRate(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {editingRate ? 'Update' : 'Add'} Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

