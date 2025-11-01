'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Wallet,
  Plus,
  Minus,
  ArrowDownRight,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

const QUICK_ACTIONS = [
  { id: 'deposit', name: 'Deposit', description: 'Add money to your wallet', icon: Plus, color: 'green' },
  { id: 'withdraw', name: 'Withdraw', description: 'Withdraw to bank account', icon: Minus, color: 'red' },
  // { id: 'transfer', name: 'Transfer', description: 'Send to another user', icon: ArrowUpRight, color: 'purple' }
];

const MAX_DEPOSIT_VERIFICATION_ATTEMPTS = 12;
const DEPOSIT_VERIFICATION_INTERVAL_MS = 5000;

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
  const depositPollTimeout = useRef(null);
  const [depositTracking, setDepositTracking] = useState({
    status: 'idle',
    reference: null,
    attempts: 0,
    error: null
  });

  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState(null);
  const [bankSearch, setBankSearch] = useState('');

  const [withdrawState, setWithdrawState] = useState({
    amount: '',
    accountNumber: '',
    bankCode: '',
    bankName: '',
    accountName: '',
    reason: '',
    loading: false,
    error: null
  });

  const [accountVerification, setAccountVerification] = useState({
    status: 'idle',
    accountName: '',
    accountNumber: '',
    bankCode: '',
    error: null,
    payload: null
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

  const loadBanks = useCallback(async () => {
    try {
      setBanksLoading(true);
      setBanksError(null);
      const headers = getAuthHeaders();
      if (!headers) {
        setBanks([]);
        setBanksError('You are not authenticated. Please log in again.');
        return;
      }

      const response = await fetch('/api/payments/paystack/banks', {
        method: 'GET',
        headers
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setBanksError('You are not authenticated. Please log in again.');
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bank list');
      }

      setBanks(Array.isArray(result.banks) ? result.banks : []);
    } catch (error) {
      console.error('Bank list fetch error:', error);
      setBanksError(error.message || 'Failed to load bank list');
    } finally {
      setBanksLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  useEffect(() => {
    return () => {
      if (depositPollTimeout.current) {
        clearTimeout(depositPollTimeout.current);
      }
    };
  }, []);

  const accountVerifyTimeout = useRef(null);

  const verifyAccountDetails = useCallback(async (accountNumber, bankCode) => {
    const headers = getAuthHeaders();

    if (!headers) {
      setAccountVerification({
        status: 'error',
        accountName: '',
        accountNumber,
        bankCode,
        error: 'You are not authenticated. Please log in again.',
        payload: null
      });
      return;
    }

    setAccountVerification({
      status: 'verifying',
      accountName: '',
      accountNumber,
      bankCode,
      error: null,
      payload: null
    });

    try {
      const response = await fetch('/api/payments/paystack/verify-account', {
        method: 'POST',
        headers,
        body: JSON.stringify({ accountNumber, bankCode })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Unable to verify account');
      }

      const verifiedAccountName = result.accountName || '';

      setAccountVerification({
        status: 'success',
        accountName: verifiedAccountName,
        accountNumber: result.accountNumber || accountNumber,
        bankCode,
        error: null,
        payload: result.payload || result
      });

      setWithdrawState((prev) => ({
        ...prev,
        accountName: verifiedAccountName
      }));
    } catch (error) {
      console.error('Account verification error:', error);
      setAccountVerification({
        status: 'error',
        accountName: '',
        accountNumber,
        bankCode,
        error: error.message || 'Unable to verify account',
        payload: null
      });

      setWithdrawState((prev) => ({
        ...prev,
        accountName: ''
      }));
    }
  }, []);

  useEffect(() => {
    if (accountVerifyTimeout.current) {
      clearTimeout(accountVerifyTimeout.current);
    }

    if (withdrawState.accountNumber && withdrawState.accountNumber.length === 10 && withdrawState.bankCode) {
      accountVerifyTimeout.current = setTimeout(() => {
        verifyAccountDetails(withdrawState.accountNumber, withdrawState.bankCode);
      }, 600);
    } else {
      setAccountVerification((prev) => {
        if (prev.status === 'idle') {
          return prev;
        }
        return {
          status: 'idle',
          accountName: '',
          accountNumber: '',
          bankCode: '',
          error: null,
          payload: null
        };
      });
    }

    return () => {
      if (accountVerifyTimeout.current) {
        clearTimeout(accountVerifyTimeout.current);
      }
    };
  }, [withdrawState.accountNumber, withdrawState.bankCode, verifyAccountDetails]);

  const pollDepositVerification = useCallback(async (reference, attempt = 0) => {
    if (!reference) {
      return;
    }

    setDepositTracking({ status: 'waiting', reference, attempts: attempt, error: null });

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setDepositTracking({
          status: 'error',
          reference,
          attempts: attempt,
          error: 'You are not authenticated. Please log in again.'
        });
        setGlobalMessage({ type: 'error', message: 'You are not authenticated. Please log in again.' });
        return;
      }

      const response = await fetch('/api/payments/deposit/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reference })
      });

      if (response.ok) {
        const data = await response.json();
        const newBalance = Number(data.walletBalance ?? 0);
        setWalletBalance(newBalance);
        setUser((prev) => (prev ? { ...prev, walletBalance: newBalance } : prev));
        updateStoredUser({ walletBalance: newBalance });
        setGlobalMessage({ type: 'success', message: 'Deposit verified and wallet balance updated.' });
        setDepositState((prev) => ({ ...prev, amount: '', reference: null, authorizationUrl: null, error: null }));
        setDepositTracking({ status: 'success', reference: null, attempts: attempt, error: null });
        if (depositPollTimeout.current) {
          clearTimeout(depositPollTimeout.current);
        }
        depositPollTimeout.current = null;
        fetchTransactions();
        return;
      }

      const result = await response.json().catch(() => ({}));
      const errorMessage = result.error || 'Awaiting Paystack confirmation';
      const shouldRetry = (response.status >= 500 || response.status === 400 || response.status === 404)
        && attempt + 1 < MAX_DEPOSIT_VERIFICATION_ATTEMPTS;

      if (shouldRetry) {
        if (depositPollTimeout.current) {
          clearTimeout(depositPollTimeout.current);
        }
        depositPollTimeout.current = setTimeout(() => {
          pollDepositVerification(reference, attempt + 1);
        }, DEPOSIT_VERIFICATION_INTERVAL_MS);
        return;
      }

      if (depositPollTimeout.current) {
        clearTimeout(depositPollTimeout.current);
      }
      setDepositTracking({ status: 'error', reference, attempts: attempt, error: errorMessage });
      setGlobalMessage({ type: 'error', message: errorMessage });
      depositPollTimeout.current = null;
    } catch (error) {
      const message = error.message || 'Verification failed';
      if (attempt + 1 < MAX_DEPOSIT_VERIFICATION_ATTEMPTS) {
        if (depositPollTimeout.current) {
          clearTimeout(depositPollTimeout.current);
        }
        depositPollTimeout.current = setTimeout(() => {
          pollDepositVerification(reference, attempt + 1);
        }, DEPOSIT_VERIFICATION_INTERVAL_MS);
      } else {
        if (depositPollTimeout.current) {
          clearTimeout(depositPollTimeout.current);
        }
        setDepositTracking({ status: 'error', reference, attempts: attempt, error: message });
        setGlobalMessage({ type: 'error', message });
        depositPollTimeout.current = null;
      }
    }
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

      if (data.authorizationUrl) {
        window.open(data.authorizationUrl, '_blank');
      }

      setGlobalMessage({ type: 'info', message: 'Deposit initialized. Waiting for Paystack confirmation...' });

      if (depositPollTimeout.current) {
        clearTimeout(depositPollTimeout.current);
        depositPollTimeout.current = null;
      }

      setDepositTracking({ status: 'waiting', reference: data.reference, attempts: 0, error: null });
      pollDepositVerification(data.reference);
    } catch (error) {
      setDepositState((prev) => ({ ...prev, error: error.message || 'Deposit initialization failed' }));
      setDepositTracking({ status: 'idle', reference: null, attempts: 0, error: null });
      if (depositPollTimeout.current) {
        clearTimeout(depositPollTimeout.current);
        depositPollTimeout.current = null;
      }
    } finally {
      setDepositState((prev) => ({ ...prev, loading: false }));
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

      if (!withdrawState.bankCode) {
        throw new Error('Select a bank before requesting withdrawal');
      }

      if (!withdrawState.accountNumber || withdrawState.accountNumber.length !== 10) {
        throw new Error('Enter a valid 10-digit account number');
      }

      if (accountVerification.status !== 'success') {
        throw new Error('Please verify the account details before withdrawing');
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
          bankName: withdrawState.bankName,
          reason: withdrawState.reason,
          verificationData: accountVerification.payload || null
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
      setWithdrawState({
        amount: '',
        accountNumber: withdrawState.accountNumber,
        bankCode: withdrawState.bankCode,
        bankName: withdrawState.bankName,
        accountName: withdrawState.accountName,
        reason: '',
        loading: false,
        error: null
      });
      setAccountVerification((prev) => ({
        ...prev,
        status: 'success'
      }));
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

  const filteredBanks = useMemo(() => {
    if (!bankSearch) {
      return banks;
    }

    const term = bankSearch.toLowerCase();
    return banks.filter((bank) =>
      (bank.name || '').toLowerCase().includes(term) ||
      (bank.slug || '').toLowerCase().includes(term) ||
      (bank.code || '').toString().includes(term)
    );
  }, [banks, bankSearch]);

  const selectedBank = useMemo(
    () => banks.find((bank) => bank.code === withdrawState.bankCode),
    [banks, withdrawState.bankCode]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">Manage deposits and withdrawals </p>
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
            : globalMessage.type === 'info'
              ? 'border-blue-200 bg-blue-50 text-blue-700'
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
              <p className="text-sm text-gray-600">Enter an amount to generate a Paystack payment link. Complete the payment and we&apos;ll confirm it automatically.</p>
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
              {depositTracking.status === 'waiting' && depositTracking.reference && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  Awaiting confirmation from Paystack... (Attempt {depositTracking.attempts + 1})
                </div>
              )}

              {depositTracking.status === 'success' && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                  Deposit confirmed successfully.
                </div>
              )}

              {depositTracking.status === 'error' && depositTracking.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {depositTracking.error}
                </div>
              )}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank</label>
                  <div className="mt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bankSearch}
                        onChange={(event) => setBankSearch(event.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="Search bank name or code"
                      />
                      <button
                        type="button"
                        onClick={loadBanks}
                        disabled={banksLoading}
                        className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {banksLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Refreshing
                          </>
                        ) : (
                          'Refresh'
                        )}
                      </button>
                    </div>
                    <select
                      value={withdrawState.bankCode}
                      onChange={(event) => {
                        const selectedCode = event.target.value;
                        const bank = banks.find((item) => item.code === selectedCode);
                        setWithdrawState((prev) => ({
                          ...prev,
                          bankCode: selectedCode,
                          bankName: bank?.name || '',
                          accountName: ''
                        }));
                        setAccountVerification({
                          status: 'idle',
                          accountName: '',
                          accountNumber: '',
                          bankCode: '',
                          error: null,
                          payload: null
                        });
                      }}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      disabled={banksLoading}
                      required
                    >
                      <option value="">Select a bank</option>
                      {filteredBanks.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                    {banksError ? (
                      <p className="text-xs text-red-600">{banksError}</p>
                    ) : selectedBank ? (
                      <p className="text-xs text-gray-500">Selected bank: {selectedBank.name}</p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\\d*"
                    maxLength={10}
                    value={withdrawState.accountNumber}
                    onChange={(event) => {
                      const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10);
                      setWithdrawState((prev) => ({ ...prev, accountNumber: digitsOnly }));
                    }}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="0123456789"
                    required
                  />
                  {accountVerification.status === 'verifying' && (
                    <div className="mt-1 flex items-center text-xs text-blue-600">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Verifying account details...
                    </div>
                  )}
                  {accountVerification.status === 'success' && (
                    <div className="mt-1 flex items-center text-xs text-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Account verified
                    </div>
                  )}
                  {accountVerification.status === 'error' && accountVerification.error && (
                    <div className="mt-1 text-xs text-red-600">
                      {accountVerification.error}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account name</label>
                  <input
                    type="text"
                    value={withdrawState.accountName}
                    readOnly
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm bg-gray-100 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder={accountVerification.status === 'success' ? accountVerification.accountName : 'Account name will appear after verification'}
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

          {/* {activeAction === 'transfer' && (
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
          )} */}
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
