const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const getSecretKey = () => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }
  return key;
};

const paystackFetch = async (path, options = {}) => {
  const secretKey = getSecretKey();
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok || data.status === false) {
    const message = data?.message || 'Paystack request failed';
    const error = new Error(message);
    error.details = data;
    throw error;
  }

  return data;
};

export const initializeTransaction = async ({ email, amount, metadata }) => {
  const payload = {
    email,
    amount: Math.round(Number(amount) * 100),
    metadata
  };
  return paystackFetch('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const verifyTransaction = async (reference) => {
  return paystackFetch(`/transaction/verify/${reference}`, {
    method: 'GET'
  });
};

export const createTransferRecipient = async ({ name, accountNumber, bankCode, currency = 'NGN' }) => {
  const payload = {
    type: 'nuban',
    name,
    account_number: accountNumber,
    bank_code: bankCode,
    currency
  };

  return paystackFetch('/transferrecipient', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const initiateTransfer = async ({ amount, reason, recipient, currency = 'NGN' }) => {
  const payload = {
    amount: Math.round(Number(amount) * 100),
    reason,
    recipient,
    currency
  };

  return paystackFetch('/transfer', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const finalizeTransfer = async ({ transferCode, otp }) => {
  const payload = {
    transfer_code: transferCode,
    otp
  };

  return paystackFetch('/transfer/finalize_transfer', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};
