export function parseTransactionMetadata(metadata) {
  if (!metadata) return {};
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }
  return metadata;
}

/**
 * Derives a user-facing status label for a transaction.
 * Exchange orders stay `pending` in the DB until admin fulfillment,
 * so we also consider metadata.paymentStatus for payment state.
 */
export function getTransactionDisplayStatus(transaction) {
  const meta = parseTransactionMetadata(transaction?.metadata);
  const dbStatus = transaction?.status || 'pending';

  if (dbStatus === 'completed') {
    return { key: 'completed', label: 'Completed', tone: 'success' };
  }
  if (dbStatus === 'failed') {
    return { key: 'failed', label: 'Failed', tone: 'danger' };
  }
  if (dbStatus === 'cancelled') {
    return { key: 'refunded', label: 'Refunded', tone: 'neutral' };
  }

  if (transaction?.type === 'exchange') {
    const paymentStatus = meta.paymentStatus || 'unpaid';
    if (paymentStatus === 'paid') {
      return { key: 'in_progress', label: 'In Progress', tone: 'info' };
    }
    return { key: 'pending_payment', label: 'Awaiting Payment', tone: 'warning' };
  }

  if (transaction?.type === 'deposit' && meta.subscriptionPayment) {
    const paystackVerified = meta.paystack?.verification?.status === 'success';
    if (dbStatus === 'pending' && paystackVerified) {
      return { key: 'in_progress', label: 'Processing', tone: 'info' };
    }
  }

  if (dbStatus === 'pending') {
    return { key: 'pending', label: 'Pending', tone: 'warning' };
  }

  return { key: dbStatus, label: dbStatus, tone: 'neutral' };
}

export function getPaystackReference(transaction) {
  const meta = parseTransactionMetadata(transaction?.metadata);
  return (
    meta.paystack?.reference ||
    meta.paystack?.transfer?.reference ||
    meta.reference ||
    null
  );
}

export const STATUS_TONE_CLASSES = {
  success: 'text-green-700 bg-green-100',
  danger: 'text-red-700 bg-red-100',
  warning: 'text-yellow-700 bg-yellow-100',
  info: 'text-blue-700 bg-blue-100',
  neutral: 'text-gray-700 bg-gray-100'
};
