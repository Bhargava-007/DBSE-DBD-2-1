const CATEGORY_KEYWORDS = {
  billing: [
    'refund', 'charge', 'charged', 'invoice', 'payment', 'bill', 'billing',
    'subscription', 'credit card', 'receipt', 'pricing', 'cost', 'renewal',
    'overcharge', 'stripe', 'fee', 'transaction'
  ],
  technical: [
    'error', 'crash', 'crashed', 'bug', 'not working', 'broken', 'fail',
    'failed', 'failure', 'exception', '500', '404', 'freeze', 'freezes',
    'issue', 'glitch', 'timeout', 'outage', 'slow', 'down', 'stack trace',
    'console', 'cannot connect', 'api error'
  ],
  account: [
    'password', 'login', 'log in', 'locked', 'unlock', '2fa', 'mfa',
    'authentication', 'auth', 'reset', 'username', 'account', 'sign in',
    'credentials', 'email address', 'profile', 'permission', 'access denied'
  ],
  shipping: [
    'delivery', 'deliver', 'tracking', 'track', 'late', 'package', 'parcel',
    'order', 'transit', 'delayed', 'delay', 'shipment', 'shipping', 'lost',
    'carrier', 'arrived', 'damaged in transit', 'courier'
  ]
};

const PRIORITY_RULES = {
  urgent: [
    'emergency', 'system down', 'all users down', 'critical outage',
    'production down', 'urgent', 'asap', 'data loss', 'security breach'
  ],
  high: [
    'down', 'outage', 'cannot access', 'critical', 'blocking', 'broken for everyone',
    'immediately', 'severe', 'deadline'
  ],
  low: [
    'how to', 'how do i', 'question', 'inquiry', 'curiosity', 'feedback',
    'documentation', 'doc', 'feature request', 'suggestion', 'clarification'
  ]
};

const SUGGESTED_REPLIES = {
  billing:
    'Hello, thank you for reaching out regarding your billing inquiry. We have pulled up your recent invoice and transaction history. Our billing department is reviewing the charges and will provide a full breakdown or process any eligible adjustments within 1 business day.',
  technical:
    'Hello, thanks for contacting our technical support team. We have logged this issue with our engineering team for triage. Could you please confirm if this persists after clearing cache or trying in an incognito window, and share any browser console logs if available?',
  account:
    'Hello, thank you for contacting account support. To protect your security, we have reviewed your account credentials and security status. If you are unable to log in, please check if a password reset link arrived in your inbox, or let us know so we can trigger a secure identity verification.',
  shipping:
    'Hello, thank you for checking on your shipment. We have requested an updated status report from the logistics carrier. We will track this package continuously and follow up with the latest delivery window as soon as dispatch confirms.',
  general:
    'Hello, thank you for reaching out to our support team. We have received your request and assigned it to the appropriate specialist. We are currently reviewing the details and will get back to you shortly.'
};

function classifyLocally(subject = '', description = '') {
  const text = `${subject} ${description}`.toLowerCase();

  // Category scores
  const categoryScores = {};
  let totalHits = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) score += matches.length;
    }
    categoryScores[cat] = score;
    totalHits += score;
  }

  let bestCategory = 'general';
  let maxScore = 0;
  for (const [cat, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat;
    }
  }

  // Priority
  let detectedPriority = 'medium';
  for (const kw of PRIORITY_RULES.urgent) {
    if (new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text)) {
      detectedPriority = 'urgent';
      break;
    }
  }
  if (detectedPriority === 'medium') {
    for (const kw of PRIORITY_RULES.high) {
      if (new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text)) {
        detectedPriority = 'high';
        break;
      }
    }
  }
  if (detectedPriority === 'medium') {
    for (const kw of PRIORITY_RULES.low) {
      if (new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text)) {
        detectedPriority = 'low';
        break;
      }
    }
  }

  // Confidence
  let confidence = 0.70;
  if (maxScore === 1) confidence = 0.78;
  else if (maxScore === 2) confidence = 0.85;
  else if (maxScore === 3) confidence = 0.90;
  else if (maxScore > 3) confidence = Math.min(0.95, 0.90 + (maxScore * 0.01));

  return {
    category: bestCategory,
    priority: detectedPriority,
    confidence: Number(confidence.toFixed(2)),
    suggestedReply: SUGGESTED_REPLIES[bestCategory] || SUGGESTED_REPLIES.general
  };
}

module.exports = { classifyLocally };

