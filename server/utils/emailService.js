const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transporter if SMTP settings are present in .env
 */
let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, ''); // Auto-clean spaces from Google App Passwords

  if (user && pass) {
    const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = Number(process.env.SMTP_PORT) || 465;

    // Use connection pool: true and keepAlive for ultra-fast, instant dispatch
    cachedTransporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      host: host.includes('gmail') ? 'smtp.gmail.com' : host,
      port: port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
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

  const transporter = getTransporter();
  let delivered = false;
  let deliveryError = null;

  if (transporter) {
    try {
      const fromAddress = process.env.SMTP_FROM || `"AlumniConnect" <${process.env.SMTP_USER || 'bhofficialcollege@gmail.com'}>`;
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html,
      });
      delivered = true;
    } catch (err) {
      deliveryError = err.message;
      console.error('❌ [SMTP Delivery Error]:', err.message);
    }
  } else {
    console.error('❌ [SMTP Not Configured]: SMTP_USER or SMTP_PASS missing');
  }

  // Log in server console for visibility & audit trail
  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL SERVICE] 6-Digit Email Verification OTP`);
  console.log(`To: ${toEmail} | Name: ${name || 'User'}`);
  console.log(`OTP Code: [ ${otp} ] (Valid for 10 minutes)`);
  if (delivered) {
    console.log(`Delivered via SMTP: YES ✅ (Sent to ${toEmail} inbox)`);
  } else if (deliveryError) {
    console.log(`Delivered via SMTP: FAILED ❌ (${deliveryError})`);
  } else {
    console.log(`Delivered via SMTP: Awaiting SMTP_USER / SMTP_PASS in server/.env (Logged above for verification)`);
  }
  console.log(`======================================================\n`);

  return { delivered, devOtp: otp };
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

  const transporter = getTransporter();
  let delivered = false;

  if (transporter) {
    try {
      const fromAddress = process.env.SMTP_FROM || `"AlumniConnect Security" <${process.env.SMTP_USER || 'security@alumniconnect.com'}>`;
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html,
      });
      delivered = true;
    } catch (err) {
      deliveryError = err.message;
      console.warn('⚠️ [SMTP Reset Password Delivery Failed]:', err.message);
    }
  }

  // Log in server console for visibility & audit trail
  console.log(`\n======================================================`);
  console.log(`🔑 [EMAIL SERVICE] 6-Digit Password Reset OTP`);
  console.log(`To: ${toEmail} | Name: ${name || 'User'}`);
  console.log(`OTP Code: [ ${otp} ] (Valid for 10 minutes)`);
  if (delivered) {
    console.log(`Delivered via SMTP: YES ✅ (Sent to ${toEmail} inbox)`);
  } else if (deliveryError) {
    console.log(`Delivered via SMTP: FAILED ❌ (${deliveryError})`);
  } else {
    console.log(`Delivered via SMTP: Awaiting SMTP_USER / SMTP_PASS in server/.env`);
  }
  console.log(`======================================================\n`);
  console.log(`======================================================\n`);

  return { delivered, devOtp: otp };
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

module.exports = {
  sendEmailVerificationOtp,
  sendPasswordResetOtp,
  sendContactNotificationEmail,
};
