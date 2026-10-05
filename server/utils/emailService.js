const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transporter with Gmail credentials and fast direct delivery
 */
let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const user = (process.env.SMTP_USER || 'bhofficialcollege@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || 'xmaz whqk yvti qksx').replace(/\s+/g, ''); // Auto-clean spaces from Google App Passwords

  if (user && pass) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      socketTimeout: 10000,
      connectionTimeout: 4000
    });
    return cachedTransporter;
  }
  return null;
};

/**
 * Send 6-Digit Email Verification OTP
 */
const sendEmailVerificationOtp = async ({ toEmail, name, otp }) => {
  const subject = `Your AlumniConnect 6-Digit Verification Code: ${otp}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #0E121C; color: #FFFFFF; border-radius: 20px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0;">AlumniConnect</h1>
        <p style="color: #38BDF8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px;">Email Verification</p>
      </div>
      <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Hello ${name || 'there'},</p>
      <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6;">
        Welcome to AlumniConnect! Please use the following 6-digit one-time password (OTP) to verify your email address.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38BDF8; background: #131826; padding: 14px 28px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.3); font-family: monospace;">
          ${otp}
        </span>
      </div>
      <p style="color: #94A3B8; font-size: 12px; line-height: 1.5; text-align: center;">
        This code is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.
      </p>
      <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 24px; padding-top: 16px; text-align: center; font-size: 11px; color: #64748B;">
        © ${new Date().getFullYear()} AlumniConnect. All rights reserved.
      </div>
    </div>
  `;

  const text = `Hello ${name || 'there'},\n\nYour AlumniConnect 6-digit verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nAlumniConnect Team`;

  const res = await dispatchEmail({ toEmail, subject, text, html });
  return { delivered: res.delivered, deliveryError: res.deliveryError, devOtp: otp };
};

/**
 * Send 6-Digit Password Reset OTP
 */
const sendPasswordResetOtp = async ({ toEmail, name, otp }) => {
  const subject = `Your AlumniConnect Password Reset Code: ${otp}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #0E121C; color: #FFFFFF; border-radius: 20px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0;">AlumniConnect</h1>
        <p style="color: #F43F5E; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px;">Password Reset Request</p>
      </div>
      <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">Hello ${name || 'User'},</p>
      <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6;">
        We received a request to reset your password. Use the following 6-digit one-time password to complete the reset:
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #F43F5E; background: #131826; padding: 14px 28px; border-radius: 14px; border: 1px solid rgba(244, 63, 94, 0.3); font-family: monospace;">
          ${otp}
        </span>
      </div>
      <p style="color: #94A3B8; font-size: 12px; line-height: 1.5; text-align: center;">
        This code expires in <strong>10 minutes</strong>. If you did not make this request, please change your password immediately or contact support.
      </p>
      <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 24px; padding-top: 16px; text-align: center; font-size: 11px; color: #64748B;">
        © ${new Date().getFullYear()} AlumniConnect. All rights reserved.
      </div>
    </div>
  `;

  const res = await dispatchEmail({ toEmail, subject, html });

  // Log in server console for visibility & audit trail
  console.log(`\n======================================================`);
  console.log(`🔑 [EMAIL SERVICE] 6-Digit Password Reset OTP`);
  console.log(`To: ${toEmail} | Name: ${name || 'User'}`);
  console.log(`OTP Code: [ ${otp} ] (Valid for 10 minutes)`);
  if (res.delivered) {
    console.log(`Delivered via SMTP: YES ✅ (Sent to ${toEmail} inbox)`);
  } else {
    console.log(`Delivered via SMTP: FAILED ❌ (${res.deliveryError || 'Unknown error'})`);
  }
  console.log(`======================================================\n`);

  return { delivered: res.delivered, deliveryError: res.deliveryError, devOtp: otp };
};

/**
 * Send Admin Notification for New Contact Form Submission
 */
const sendContactNotificationEmail = async ({ name, email, subject: msgSubject, message }) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@alumniconnect.com';
  const subject = `📬 New Contact Inquiry: ${msgSubject} (from ${name})`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0E121C; color: #FFFFFF; border-radius: 20px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="margin-bottom: 24px;">
        <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0;">AlumniConnect</h1>
        <p style="color: #38BDF8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px;">New Contact Submission</p>
      </div>
      <div style="background: #131826; border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; color: #94A3B8; font-size: 13px;"><strong style="color: #FFFFFF;">From:</strong> ${name} &lt;${email}&gt;</p>
        <p style="margin: 0 0 16px 0; color: #94A3B8; font-size: 13px;"><strong style="color: #FFFFFF;">Subject:</strong> ${msgSubject}</p>
        <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
          <p style="margin: 0; color: #E2E8F0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
      <p style="color: #64748B; font-size: 12px;">
        You can reply directly to this inquiry by emailing <a href="mailto:${email}" style="color: #38BDF8;">${email}</a> or via the Admin Dashboard.
      </p>
    </div>
  `;

  const transporter = getTransporter();
  let delivered = false;

  if (transporter && adminEmail) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"AlumniConnect Notifications" <notifications@alumniconnect.com>',
        to: adminEmail,
        replyTo: email,
        subject,
        html,
      });
      delivered = true;
    } catch (err) {
      console.warn('SMTP delivery for contact inquiry failed:', err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`📬 [EMAIL SERVICE] New Contact Form Inquiry Received`);
  console.log(`From: ${name} (${email})`);
  console.log(`Subject: ${msgSubject}`);
  console.log(`Message Preview: ${message.slice(0, 100)}...`);
  console.log(`Forwarded to Admin (${adminEmail}): ${delivered ? 'YES' : 'NO (Dev Simulation Mode)'}`);
  console.log(`======================================================\n`);

  return { delivered };
};

/**
 * Core email dispatcher with primary SMTP (Gmail) and fallback Resend HTTPS
 */
const dispatchEmail = async ({ toEmail, subject, html, text }) => {
  let delivered = false;
  let deliveryError = null;

  // 1. Cloud HTTPS Relay (Google Apps Script Web App - bypasses Render SMTP port blocks completely)
  const googleScriptUrl = (process.env.GOOGLE_SCRIPT_URL || '').trim();
  if (googleScriptUrl) {
    try {
      const resp = await fetch(googleScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toEmail, subject, text, html })
      });
      const data = await resp.json();
      if (data && (data.delivered || data.status === 'success' || data.success)) {
        delivered = true;
        console.log(`✅ [HTTPS Webhook] Email sent successfully via Google Apps Script to ${toEmail} | Subject: "${subject}"`);
        return { delivered: true, provider: 'google_script' };
      }
    } catch (scriptErr) {
      console.warn(`⚠️ [Google Apps Script HTTPS Failed for ${toEmail}]:`, scriptErr.message);
    }
  }

  // 2. SMTP Transporter (Gmail) - Delivers to ANY email without domain restrictions (Works on Localhost & Vercel)
  const transporter = getTransporter();
  if (transporter) {
    try {
      const fromAddress = process.env.SMTP_FROM || `"AlumniConnect" <${process.env.SMTP_USER || 'bhofficialcollege@gmail.com'}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        text,
        html
      });
      delivered = true;
      console.log(`✅ [SMTP Delivery] Email sent successfully to ${toEmail} | Subject: "${subject}" | MessageId: ${info?.messageId || 'OK'}`);
      return { delivered: true, provider: 'smtp', messageId: info?.messageId };
    } catch (smtpErr) {
      deliveryError = smtpErr.message;
      console.warn(`⚠️ [SMTP Delivery Failed for ${toEmail}]:`, smtpErr.message, 'Trying Resend fallback...');
    }
  }

  // 2. Fallback: Resend HTTPS API (Works for account owner / verified custom domain)
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!delivered && resendApiKey) {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(resendApiKey);
      const fromAddr = process.env.FROM_EMAIL || 'AlumniConnect <onboarding@resend.dev>';
      const resendResult = await resend.emails.send({
        from: fromAddr,
        to: toEmail,
        subject,
        html,
        text
      });

      if (!resendResult.error) {
        delivered = true;
        console.log(`✅ [RESEND API] Email delivered successfully to ${toEmail} | Subject: "${subject}"`);
        return { delivered: true, provider: 'resend', id: resendResult.data?.id };
      } else {
        deliveryError = resendResult.error.message || 'Resend error';
        console.warn(`⚠️ [Resend API Note for ${toEmail}]: ${deliveryError}`);
      }
    } catch (err) {
      deliveryError = deliveryError ? `${deliveryError} | Resend: ${err.message}` : err.message;
      console.warn(`⚠️ [Resend API Failed for ${toEmail}]:`, err.message);
    }
  }

  return { delivered, deliveryError };
};

/**
 * Format date for friendly human reading in emails
 */
const formatFriendlyDate = (dateVal) => {
  if (!dateVal) return 'Flexible / To be coordinated';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return String(dateVal);
  }
};

/**
 * Safely resolves a valid frontend base URL.
 * Discards wildcards like '*' or invalid schemes, and prioritizes dynamically detected origin.
 */
const resolveFrontendUrl = (clientUrl) => {
  // 1. Direct client URL from request header (Origin or Referer)
  if (clientUrl && typeof clientUrl === 'string') {
    const trimmed = clientUrl.trim().replace(/\/+$/, '');
    if (trimmed && trimmed !== '*' && !trimmed.includes('*')) {
      if (/^https?:\/\/[^/]+/i.test(trimmed)) {
        return trimmed;
      }
    }
  }

  // 2. Inspect process.env.FRONTEND_URL
  const rawEnv = (process.env.FRONTEND_URL || '').trim();
  if (rawEnv) {
    const candidates = rawEnv.split(',').map(s => s.trim().replace(/\/+$/, ''));
    for (const c of candidates) {
      if (c && c !== '*' && !c.includes('*') && /^https?:\/\/[^/]+/i.test(c)) {
        return c;
      }
    }
  }

  // 3. Inspect other common deployment environment variables
  for (const envKey of ['CLIENT_URL', 'APP_URL', 'VERCEL_URL']) {
    const val = (process.env[envKey] || '').trim().replace(/\/+$/, '');
    if (val && val !== '*' && !val.includes('*')) {
      if (/^https?:\/\/[^/]+/i.test(val)) return val;
      return `https://${val}`;
    }
  }

  // 4. Default fallback
  return 'http://localhost:5173';
};

/**
 * Send Email Notification to Mentor when a student requests a new session
 */
const sendSessionRequestEmailToMentor = async ({ mentor, student, topic, message, preferredDate, clientUrl }) => {
  if (!mentor || !mentor.email) {
    console.warn('⚠️ [sendSessionRequestEmailToMentor] No mentor email found');
    return { delivered: false, error: 'No mentor email' };
  }

  const frontendUrl = resolveFrontendUrl(clientUrl);
  const mentorName = mentor.name || 'Mentor';
  const studentName = student?.name || 'Student';
  const studentEmail = student?.email || '';
  const formattedDate = formatFriendlyDate(preferredDate);

  const subject = `New Mentorship Request from ${studentName}: ${topic}`;

  const text = `Hello ${mentorName},

You have received a new mentorship session request from ${studentName}.

Student: ${studentName} (${studentEmail})
Topic: ${topic}
Preferred Time: ${formattedDate}
Message: ${message || 'No additional message provided.'}

To accept, decline, or reschedule this session, visit your dashboard:
${frontendUrl}/dashboard/mentor

Regards,
AlumniConnect Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
      <h2 style="color: #2563eb; margin-top: 0; font-size: 20px;">New Mentorship Request</h2>
      <p style="font-size: 15px;">Hello <strong>${mentorName}</strong>,</p>
      <p style="font-size: 15px;">You have received a new 1-on-1 mentorship session request on AlumniConnect from <strong>${studentName}</strong>.</p>
      
      <div style="background-color: #f8fafc; padding: 16px 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <p style="margin: 6px 0;"><strong>Student Name:</strong> ${studentName}</p>
        <p style="margin: 6px 0;"><strong>Student Email:</strong> <a href="mailto:${studentEmail}" style="color: #2563eb;">${studentEmail}</a></p>
        <p style="margin: 6px 0;"><strong>Topic:</strong> ${topic}</p>
        <p style="margin: 6px 0;"><strong>Preferred Time:</strong> ${formattedDate}</p>
        ${message ? `<p style="margin: 8px 0 4px 0;"><strong>Student's Message:</strong><br><span style="color: #475569; font-style: italic;">"${message}"</span></p>` : ''}
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${frontendUrl}/dashboard/mentor" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
          Review & Respond in Dashboard
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        AlumniConnect Mentorship Platform • <a href="${frontendUrl}/dashboard/mentor" style="color: #2563eb;">${frontendUrl}/dashboard/mentor</a>
      </p>
    </div>
  `;

  return await dispatchEmail({ toEmail: mentor.email, subject, text, html });
};

/**
 * Send Email Notification to Student when a mentor Approves or Rejects their session
 */
const sendSessionStatusEmailToStudent = async ({ student, mentor, status, topic, scheduledDate, mentorNotes, clientUrl }) => {
  if (!student || !student.email) {
    console.warn('⚠️ [sendSessionStatusEmailToStudent] No student email found');
    return { delivered: false, error: 'No student email' };
  }

  const frontendUrl = resolveFrontendUrl(clientUrl);
  const studentName = student?.name || 'Student';
  const mentorName = mentor?.name || 'Alumni Mentor';
  const mentorCompany = mentor?.company || mentor?.domain || 'Alumni';
  const formattedDate = formatFriendlyDate(scheduledDate);
  const isApproved = status === 'approved';

  const subject = isApproved
    ? `Mentorship Session Approved: ${mentorName}`
    : `Mentorship Session Update: ${mentorName}`;

  const text = isApproved
    ? `Hello ${studentName},

Good news! Your mentorship session request with ${mentorName} (${mentorCompany}) has been APPROVED.

Session Details:
- Mentor: ${mentorName} (${mentorCompany})
- Topic: ${topic}
- Scheduled Time: ${formattedDate}
${mentorNotes ? `- Meeting Notes / Link: ${mentorNotes}\n` : ''}
View your session details in your student dashboard:
${frontendUrl}/dashboard/student

Regards,
AlumniConnect Team`
    : `Hello ${studentName},

Your mentorship session request with ${mentorName} for "${topic}" could not be accommodated at this time.

Mentors are working professionals and may have schedule conflicts. You can browse and connect with other alumni mentors on the platform:
${frontendUrl}/dashboard/student

Regards,
AlumniConnect Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
      <h2 style="color: ${isApproved ? '#16a34a' : '#dc2626'}; margin-top: 0; font-size: 20px;">
        ${isApproved ? 'Mentorship Session Approved' : 'Mentorship Request Update'}
      </h2>
      <p style="font-size: 15px;">Hello <strong>${studentName}</strong>,</p>
      
      ${isApproved ? `
      <p style="font-size: 15px;">Your 1-on-1 mentorship session request with <strong>${mentorName}</strong> (${mentorCompany}) has been <span style="color: #16a34a; font-weight: bold;">APPROVED</span>.</p>

      <div style="background-color: #f0fdf4; padding: 16px 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
        <p style="margin: 6px 0;"><strong>Mentor:</strong> ${mentorName} (${mentorCompany})</p>
        <p style="margin: 6px 0;"><strong>Topic:</strong> ${topic}</p>
        <p style="margin: 6px 0;"><strong>Scheduled Time:</strong> ${formattedDate}</p>
        ${mentorNotes ? `<p style="margin: 10px 0 4px 0;"><strong>Meeting Notes / Link:</strong><br><span style="color: #15803d;">${mentorNotes}</span></p>` : ''}
      </div>
      ` : `
      <p style="font-size: 15px;">Your mentorship session request with <strong>${mentorName}</strong> for "<strong>${topic}</strong>" could not be accommodated at this time.</p>
      
      <div style="background-color: #fef2f2; padding: 16px 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p style="margin: 4px 0; color: #475569;">Mentors are working professionals and may have temporary scheduling conflicts. Feel free to request another slot or connect with other verified alumni mentors.</p>
      </div>
      `}

      <div style="text-align: center; margin: 28px 0;">
        <a href="${frontendUrl}/dashboard/student" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
          View in Student Dashboard
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        AlumniConnect Mentorship Platform • <a href="${frontendUrl}/dashboard/student" style="color: #2563eb;">${frontendUrl}/dashboard/student</a>
      </p>
    </div>
  `;

  return await dispatchEmail({ toEmail: student.email, subject, text, html });
};

module.exports = {
  sendEmailVerificationOtp,
  sendPasswordResetOtp,
  sendContactNotificationEmail,
  sendSessionRequestEmailToMentor,
  sendSessionStatusEmailToStudent,
};
