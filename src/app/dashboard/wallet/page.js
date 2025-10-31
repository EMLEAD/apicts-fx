'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const QUICK_ACTIONS = [
  { id: 'deposit', name: 'Deposit', description: 'Add money to your wallet', icon: Plus, color: 'green' },
  { id: 'withdraw', name: 'Withdraw', description: 'Withdraw to bank account', icon: Minus, color: 'red' },
  { id: 'transfer', name: 'Transfer', description: 'Send to another user', icon: ArrowUpRight, color: 'purple' }
];

const formatCurrency = (amount, currency = 'NGN') => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(numericAmount);
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

const updateStoredUser = (updates = {}) => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('user');
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    const updated = { ...parsed, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update stored user', error);
  }
};

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [currency, setCurrency] = useState('NGN');
  const [showBalance, setShowBalance] = useState(true);
  const [activeAction, setActiveAction] = useState('deposit');
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
  const [globalMessage, setGlobalMessage] = useState(null);

  const [depositState, setDepositState] = useState({ amount: '', loading: false, error: null, reference: null, authorizationUrl: null });
  const [depositVerification, setDepositVerification] = useState({ reference: '', loading: false, error: null });

  const [withdrawState, setWithdrawState] = useState({
    amount: '',
    accountNumber: '',
    bankCode: '',
    accountName: '',
    reason: '',
    loading: false,
    error: null
  });

  const [transferState, setTransferState] = useState({
    recipientIdentifier: '',
    recipientType: 'username',
    amount: '',
    note: '',
    fee: '',
    loading: false,
    error: null
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setWalletBalance(Number(parsed.walletBalance) || 0);
        setCurrency(parsed.currency || 'NGN');
      } catch (error) {
        console.error('Failed to parse stored user', error);
      }
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch('/api/payments/transactions?limit=20', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to load transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Transactions fetch error:', error);
      setTransactionsError(error.message || 'Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDepositInitialize = async (event) => {
    event.preventDefault();
    if (depositState.loading) return;

    try {
      setDepositState((prev) => ({ ...prev, loading: true, error: null }));
      setGlobalMessage(null);

      const headers = getAuthHeaders();
      if (!headers) throw new Error('You are not authenticated. Please log in again.');

      const numericAmount = Number(depositState.amount);
      if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Enter a valid deposit amount greater than zero');
      }

      const response = await fetch('/api/payments/deposit/initialize', {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount: numericAmount, currency })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to initialize deposit');
      }

      const data = await response.json();
      setDepositState((prev) => ({
        ...prev,
        authorizationUrl: data.authorizationUrl,
        reference: data.reference
      }));

      setGlobalMessage({ type: 'success', message: 'Deposit initialized. Complete the payment in the newly opened Paystack window, then verify using the reference.' });

      if (data.authorizationUrl) {
        window.open(data.authorizationUrl, '_blank');
      }
    } catch (error) {
      setDepositState((prev) => ({ ...prev, error: error.message || 'Deposit initialization failed' }));
    } finally {
      setDepositState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDepositVerify = async (event) => {
    event.preventDefault();
    if (depositVerification.loading) return;

    try {
      setDepositVerification((prev) => ({ ...prev, loading: true, error: null }));
      setGlobalMessage(null);

      const headers = getAuthHeaders();
      if (!headers) throw new Error('You are not authenticated. Please log in again.');

      const reference = depositVerification.reference || depositState.reference;
      if (!reference) {
        throw new Error('Enter a Paystack reference to verify');
      }

      const response = await fetch('/api/payments/deposit/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reference })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Verification failed');
      }

      const data = await response.json();
      const newBalance = Number(data.walletBalance ?? walletBalance);
      setWalletBalance(newBalance);
      updateStoredUser({ walletBalance: newBalance });
      setGlobalMessage({ type: 'success', message: 'Deposit verified and wallet balance updated.' });
      setDepositVerification({ reference: '', loading: false, error: null });
      setDepositState((prev) => ({ ...prev, reference: null }));
      fetchTransactions();
    } catch (error) {
      setDepositVerification((prev) => ({ ...prev, error: error.message || 'Verification failed', loading: false }));
    }
  };

  const handleWithdraw = async (event) => {
    event.preventDefault();
    if (withdrawState.loading) return;

    try {
      setWithdrawState((prev) => ({ ...prev, loading: true, error: null }));
      setGlobalMessage(null);

      const headers = getAuthHeaders();
      if (!headers) throw new Error('You are not authenticated. Please log in again.');

      const numericAmount = Number(withdrawState.amount);
      if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Enter a valid withdrawal amount greater than zero');
      }

      const response = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: numericAmount,
          currency,
          accountNumber: withdrawState.accountNumber,
          bankCode: withdrawState.bankCode,
          accountName: withdrawState.accountName,
          reason: withdrawState.reason
        })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Withdrawal failed');
      }

      const data = await response.json();
      const newBalance = Number(data.walletBalance ?? walletBalance);
      setWalletBalance(newBalance);
      updateStoredUser({ walletBalance: newBalance });
      setGlobalMessage({ type: 'success', message: 'Withdrawal initiated successfully.' });
      setWithdrawState({ amount: '', accountNumber: '', bankCode: '', accountName: '', reason: '', loading: false, error: null });
      fetchTransactions();
    } catch (error) {
      setWithdrawState((prev) => ({ ...prev, error: error.message || 'Withdrawal failed', loading: false }));
    }
  };

  const handleTransfer = async (event) => {
    event.preventDefault();
    if (transferState.loading) return;

    try {
      setTransferState((prev) => ({ ...prev, loading: true, error: null }));
      setGlobalMessage(null);

      const headers = getAuthHeaders();
      if (!headers) throw new Error('You are not authenticated. Please log in again.');

      const numericAmount = Number(transferState.amount);
      if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Enter a valid transfer amount greater than zero');
      }

      const payload = {
        amount: numericAmount,
        currency,
        note: transferState.note,
        fee: transferState.fee ? Number(transferState.fee) : 0
      };

      if (transferState.recipientType === 'email') {
        payload.recipientEmail = transferState.recipientIdentifier;
      } else if (transferState.recipientType === 'id') {
        payload.recipientId = transferState.recipientIdentifier;
      } else {
        payload.recipientUsername = transferState.recipientIdentifier;
      }

      const response = await fetch('/api/payments/transfer', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Transfer failed');
      }

      const data = await response.json();
      const newBalance = Number(data.transfer?.sender?.walletBalance ?? walletBalance);
      setWalletBalance(newBalance);
      updateStoredUser({ walletBalance: newBalance });
      setGlobalMessage({ type: 'success', message: 'Transfer completed successfully.' });
      setTransferState({ recipientIdentifier: '', recipientType: 'username', amount: '', note: '', fee: '', loading: false, error: null });
      fetchTransactions();
    } catch (error) {
      setTransferState((prev) => ({ ...prev, error: error.message || 'Transfer failed', loading: false }));
    }
  };

  const walletSummary = useMemo(() => ({
    balance: walletBalance,
    currency,
    change: '+0%',
    changeType: 'positive'
  }), [walletBalance, currency]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">Manage deposits, withdrawals, and transfers seamlessly.</p>
        </div>
        <button
          onClick={() => setShowBalance((prev) => !prev)}
          className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {showBalance ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showBalance ? 'Hide balance' : 'Show balance'}
        </button>
      </div>

      {globalMessage && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          globalMessage.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {globalMessage.message}
        </div>
      )}

      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-100 mb-1">Wallet Balance</p>
            <p className="text-4xl font-bold">
              {showBalance ? formatCurrency(walletSummary.balance, walletSummary.currency) : '••••••'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-300" />
            <span className="text-sm text-green-200">{walletSummary.change}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id;
          return (
            <button
              key={action.id}
              onClick={() => setActiveAction(action.id)}
              className={`rounded-xl border px-4 py-4 text-left shadow-sm transition-colors ${
                isActive ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  action.color === 'green'
                    ? 'bg-green-100 text-green-600'
                    : action.color === 'red'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{action.name}</p>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          {activeAction === 'deposit' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Deposit funds</h2>
              <p className="text-sm text-gray-600">Enter an amount to generate a Paystack payment link. Complete the payment, then verify to credit your wallet.</p>
              <form onSubmit={handleDepositInitialize} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={depositState.amount}
                    onChange={(event) => setDepositState((prev) => ({ ...prev, amount: event.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                {depositState.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {depositState.error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={depositState.loading}
                  className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {depositState.loading ? 'Initializing...' : 'Initialize deposit'}
                </button>
              </form>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Verify deposit</h3>
                <p className="text-xs text-gray-600">Paste the Paystack reference after completing payment, or use the reference we generated for you.</p>
                <form onSubmit={handleDepositVerify} className="space-y-3">
                  <input
                    type="text"
                    value={depositVerification.reference || depositState.reference || ''}
                    onChange={(event) => setDepositVerification((prev) => ({ ...prev, reference: event.target.value }))}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 uppercase"
                    placeholder="PAYSTACK_REFERENCE"
                  />
                  {depositVerification.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {depositVerification.error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={depositVerification.loading}
                    className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {depositVerification.loading ? 'Verifying...' : 'Verify deposit'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeAction === 'withdraw' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Withdraw funds</h2>
              <p className="text-sm text-gray-600">Funds will be sent from our Paystack balance to the account below.</p>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={withdrawState.amount}
                    onChange={(event) => setWithdrawState((prev) => ({ ...prev, amount: event.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account number</label>
                    <input
                      type="text"
                      value={withdrawState.accountNumber}
                      onChange={(event) => setWithdrawState((prev) => ({ ...prev, accountNumber: event.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="0123456789"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank code</label>
                    <input
                      type="text"
                      value={withdrawState.bankCode}
                      onChange={(event) => setWithdrawState((prev) => ({ ...prev, bankCode: event.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="011"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account name</label>
                  <input
                    type="text"
                    value={withdrawState.accountName}
                    onChange={(event) => setWithdrawState((prev) => ({ ...prev, accountName: event.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason (optional)</label>
                  <textarea
                    value={withdrawState.reason}
                    onChange={(event) => setWithdrawState((prev) => ({ ...prev, reason: event.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Payout for..."
                  />
                </div>
                {withdrawState.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {withdrawState.error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={withdrawState.loading}
                  className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {withdrawState.loading ? 'Processing...' : 'Submit withdrawal'}
                </button>
              </form>
            </div>
          )}

          {activeAction === 'transfer' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Transfer to another user</h2>
              <p className="text-sm text-gray-600">Send funds to another wallet on the platform.</p>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recipient identifier</label>
                    <input
                      type="text"
                      value={transferState.recipientIdentifier}
                      onChange={(event) => setTransferState((prev) => ({ ...prev, recipientIdentifier: event.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder={transferState.recipientType === 'email' ? 'user@example.com' : transferState.recipientType === 'id' ? 'dd7a...' : 'username'}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Identifier type</label>
                    <select
                      value={transferState.recipientType}
                      onChange={(event) => setTransferState((prev) => ({ ...prev, recipientType: event.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="username">Username</option>
                      <option value="email">Email</option>
                      <option value="id">User ID</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={transferState.amount}
                      onChange={(event) => setTransferState((prev) => ({ ...prev, amount: event.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fee (optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={transferState.fee}
                      onChange={(event) => setTransferState((prev) => ({ ...prev, fee: event.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
                  <textarea
                    value={transferState.note}
                    onChange={(event) => setTransferState((prev) => ({ ...prev, note: event.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Thanks for..."
                  />
                </div>
                {transferState.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {transferState.error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={transferState.loading}
                  className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {transferState.loading ? 'Transferring...' : 'Send transfer'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent transactions</h2>
            </div>
            <button
              onClick={fetchTransactions}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          <div className="px-6 py-6">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                Loading transactions...
              </div>
            ) : transactionsError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {transactionsError}
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-12 text-center">
                <p className="text-sm font-medium text-gray-700">No transactions yet</p>
                <p className="mt-1 text-xs text-gray-500">Your wallet activity will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => {
                  const isCredit = transaction.type === 'deposit' || transaction.metadata?.direction === 'credit';
                  const amountDisplay = `${isCredit ? '+' : '-'}${formatCurrency(transaction.amount, transaction.currency)}`;
                  const statusBadge = transaction.status === 'completed'
                    ? { icon: CheckCircle, text: 'Completed', color: 'text-green-600', bg: 'bg-green-100' }
                    : transaction.status === 'pending'
                    ? { icon: Clock, text: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' }
                    : { icon: AlertCircle, text: transaction.status, color: 'text-red-600', bg: 'bg-red-100' };

                  return (
                    <div key={transaction.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 capitalize">{transaction.type}</span>
                        <span className="text-xs text-gray-500">
                          {(transaction.description || '').slice(0, 60) || 'Wallet transaction'}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>{amountDisplay}</p>
                        <div className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge.bg} ${statusBadge.color}`}>
                          <statusBadge.icon className="h-3 w-3" />
                          <span>{statusBadge.text}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
