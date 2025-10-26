'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, UserCheck, UserX, Mail, Shield, Eye, Edit2, CheckCircle, XCircle, Calendar, Phone, User, Wallet, DollarSign } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [walletAction, setWalletAction] = useState('add');
  const [walletAmount, setWalletAmount] = useState('');
  const [showWalletForm, setShowWalletForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterStatus, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(user => user.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(user => !user.isActive);
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const updateWalletBalance = async (userId, amount, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/wallet`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, action })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedUser({ ...selectedUser, walletBalance: data.user.walletBalance });
        fetchUsers();
        setShowWalletForm(false);
        setWalletAmount('');
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage and verify user accounts</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-green-600" />
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          ₦{parseFloat(user.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">{user.currency || 'NGN'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => updateUserStatus(user.id, !user.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {selectedUser.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.username}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedUser.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedUser.role === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : selectedUser.role === 'moderator'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedUser.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User ID */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <h4 className="text-sm font-medium text-gray-600">User ID</h4>
                  </div>
                  <p className="text-sm font-mono text-gray-900">{selectedUser.id}</p>
                </div>

                {/* Email */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <h4 className="text-sm font-medium text-gray-600">Email Address</h4>
                  </div>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>

                {/* Username */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <h4 className="text-sm font-medium text-gray-600">Username</h4>
                  </div>
                  <p className="text-sm text-gray-900">{selectedUser.username}</p>
                </div>

                {/* Role */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <h4 className="text-sm font-medium text-gray-600">Role</h4>
                  </div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{selectedUser.role}</p>
                </div>

                {/* Account Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {selectedUser.isActive ? (
                      <UserCheck className="h-5 w-5 text-green-600" />
                    ) : (
                      <UserX className="h-5 w-5 text-gray-600" />
                    )}
                    <h4 className="text-sm font-medium text-gray-600">Account Status</h4>
                  </div>
                  <p className={`text-sm font-medium ${
                    selectedUser.isActive ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>

                {/* Last Login */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <h4 className="text-sm font-medium text-gray-600">Last Login</h4>
                  </div>
                  <p className="text-sm text-gray-900">
                    {selectedUser.lastLogin 
                      ? new Date(selectedUser.lastLogin).toLocaleString()
                      : 'Never logged in'
                    }
                  </p>
                </div>

                {/* Created At */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <h4 className="text-sm font-medium text-gray-600">Account Created</h4>
                  </div>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Updated At */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <h4 className="text-sm font-medium text-gray-600">Last Updated</h4>
                  </div>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.updatedAt).toLocaleString()}
                  </p>
                </div>

                {/* Firebase UID */}
                {selectedUser.firebaseUid && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <h4 className="text-sm font-medium text-gray-600">Firebase UID</h4>
                    </div>
                    <p className="text-sm font-mono text-gray-900 break-all">{selectedUser.firebaseUid}</p>
                  </div>
                )}

                {/* Profile Picture */}
                {selectedUser.profilePicture && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <h4 className="text-sm font-medium text-gray-600">Profile Picture</h4>
                    </div>
                    <img 
                      src={selectedUser.profilePicture} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                )}

                {/* Wallet Balance */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wallet className="h-5 w-5 text-green-600" />
                    <h4 className="text-sm font-medium text-green-900">Wallet Balance</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    ₦{parseFloat(selectedUser.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-green-600 mt-1">{selectedUser.currency || 'NGN'}</p>
                </div>
              </div>

              {/* Wallet Management */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Wallet Management</h4>
                  <button
                    onClick={() => setShowWalletForm(!showWalletForm)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center space-x-2"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>{showWalletForm ? 'Cancel' : 'Update Balance'}</span>
                  </button>
                </div>

                {showWalletForm && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                        <select
                          value={walletAction}
                          onChange={(e) => setWalletAction(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="add">Add Funds</option>
                          <option value="subtract">Deduct Funds</option>
                          <option value="set">Set Balance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount ({selectedUser.currency || 'NGN'})</label>
                        <input
                          type="number"
                          step="0.01"
                          value={walletAmount}
                          onChange={(e) => setWalletAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (walletAmount && !isNaN(walletAmount) && parseFloat(walletAmount) > 0) {
                          updateWalletBalance(selectedUser.id, walletAmount, walletAction);
                        }
                      }}
                      className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      {walletAction === 'add' && 'Add Funds'}
                      {walletAction === 'subtract' && 'Deduct Funds'}
                      {walletAction === 'set' && 'Set Balance'}
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      updateUserStatus(selectedUser.id, !selectedUser.isActive);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedUser.isActive
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      const newRole = selectedUser.role === 'admin' ? 'user' : selectedUser.role === 'user' ? 'moderator' : 'admin';
                      updateUserRole(selectedUser.id, newRole);
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                  >
                    Change Role
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this user?')) {
                        deleteUser(selectedUser.id);
                        setSelectedUser(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

