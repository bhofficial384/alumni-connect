/**
 * AlumniConnect SMS Dispatch Service
 * Delivers actual SMS OTP to registered phone numbers via Fast2SMS
 * (Instant Indian SMS Gateway - https://www.fast2sms.com)
 */

/**
 * Format phone number into:
 * - digits10: 9876543210 (Fast2SMS standard format)
 * - e164: +919876543210 (E.164 international format)
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return { e164: '', digits10: '', raw: '' };
  const raw = String(phone).trim();
  const digitsOnly = raw.replace(/\D/g, '');

  let digits10 = digitsOnly;
  if (digitsOnly.length > 10 && (digitsOnly.startsWith('91') || digitsOnly.startsWith('091'))) {
    digits10 = digitsOnly.slice(-10);
  } else if (digitsOnly.length > 10) {
    digits10 = digitsOnly.slice(-10);
  }

  const e164 = `+91${digits10}`;
  return { e164, digits10, raw };
};

/**
 * Dispatch actual SMS OTP via Fast2SMS REST API
 */
const sendViaFast2SMS = async ({ digits10, otp }) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    return { attempted: false, error: 'Fast2SMS API key not set in environment.' };
  }

  const cleanDigits = String(digits10).trim();
  if (cleanDigits.length !== 10) {
    throw new Error(`Invalid mobile number format (${cleanDigits}). Fast2SMS requires a 10-digit Indian mobile number.`);
  }

  const url = 'https://www.fast2sms.com/dev/bulkV2';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'authorization': apiKey.trim(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      route: 'otp',
      variables_values: String(otp).trim(),
      numbers: cleanDigits
    })
  });

  const data = await response.json();
  if (response.ok && (data.return === true || data.status_code === 200)) {
    return {
      attempted: true,
      delivered: true,
      provider: 'Fast2SMS',
      requestId: data.request_id || 'sent'
    };
  } else {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Fast2SMS dispatch failed');
    throw new Error(errorMsg);
  }
};

/**
 * Main Phone Verification OTP Sender
 */
const sendPhoneVerificationOtp = async ({ phoneNumber, name, otp }) => {
  const { e164, digits10, raw } = formatPhoneNumber(phoneNumber);
  let delivered = false;
  let providerUsed = 'None';
  let deliveryError = null;

  // Dispatch via Fast2SMS
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const res = await sendViaFast2SMS({ digits10, otp });
      if (res.delivered) {
        delivered = true;
        providerUsed = 'Fast2SMS';
      }
    } catch (err) {
      console.warn('[SMS Gateway] Fast2SMS error:', err.message);
      deliveryError = err.message;
    }
  } else {
    deliveryError = 'Fast2SMS API key is not configured in server/.env.';
  }

  // Clear Terminal Output for Developer Visibility & Audit Logging
  console.log(`\n======================================================`);
  console.log(`📱 [SMS SERVICE] 6-Digit Phone OTP Dispatch (Fast2SMS)`);
  console.log(`Recipient: ${name || 'User'} | Raw: ${raw}`);
  console.log(`Target Phone: ${e164} (Indian 10-digit: ${digits10})`);
  console.log(`OTP Code: [ ${otp} ] (Valid for 10 minutes)`);
  if (delivered) {
    console.log(`✅ ACTUAL SMS DISPATCHED via: ${providerUsed}`);
  } else {
    console.log(`⚠️ SMS delivery could not be confirmed.`);
    if (deliveryError) {
      console.log(`   Gateway notice: ${deliveryError}`);
    }
  }
  console.log(`======================================================\n`);

  return {
    delivered,
    provider: providerUsed,
    e164,
    digits10,
    deliveryError
  };
};

module.exports = {
  formatPhoneNumber,
  sendPhoneVerificationOtp
};
