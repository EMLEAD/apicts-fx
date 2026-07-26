const { UserDocument } = require('@/lib/db/models');

/**
 * Check if a user has a verified NIN document.
 * Returns { verified: boolean, reason?: string, hasSubmitted: boolean }
 */
async function checkNinVerification(userId) {
  const ninDoc = await UserDocument.findOne({
    where: {
      userId,
      documentType: 'nin',
    },
    order: [['createdAt', 'DESC']],
  });

  if (!ninDoc) {
    return { verified: false, reason: 'no_document', hasSubmitted: false };
  }

  if (ninDoc.verificationStatus === 'verified') {
    return { verified: true, hasSubmitted: true };
  }

  if (ninDoc.verificationStatus === 'pending') {
    return { verified: false, reason: 'pending_review', hasSubmitted: true };
  }

  if (ninDoc.verificationStatus === 'rejected') {
    return { verified: false, reason: ninDoc.rejectionReason || 'rejected', hasSubmitted: true };
  }

  if (ninDoc.verificationStatus === 'expired') {
    return { verified: false, reason: 'expired', hasSubmitted: true };
  }

  return { verified: false, reason: 'unknown', hasSubmitted: true };
}

/**
 * Middleware-style check for API routes.
 * Returns a NextResponse (403) if not verified, or null if OK.
 */
async function requireNinVerification(userId) {
  const result = await checkNinVerification(userId);

  if (result.verified) return null;

  const messages = {
    no_document: 'NIN verification is required. Please upload your NIN document in your profile to buy or sell.',
    pending_review: 'Your NIN document is pending review. You\'ll be able to buy or sell once it\'s verified.',
    rejected: 'Your NIN verification was rejected. Please re-upload a valid NIN document in your profile.',
    expired: 'Your NIN verification has expired. Please upload a fresh NIN document in your profile.',
  };

  return {
    error: messages[result.reason] || 'NIN verification is required to perform this action.',
    verificationStatus: result.reason,
    hasSubmitted: result.hasSubmitted,
  };
}

module.exports = { checkNinVerification, requireNinVerification };
