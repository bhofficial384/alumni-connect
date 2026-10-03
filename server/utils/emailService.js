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

    return {
      sendMail: async (mailOptions) => {
        // Try Port 587 (STARTTLS standard submission) first, then Port 465 (SSL)
        try {
          const t587 = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: { user, pass },
            connectionTimeout: 7000
          });
          return await t587.sendMail(mailOptions);
        } catch (e587) {
          console.warn('Port 587 attempt failed, trying Port 465 SSL:', e587.message);
          const t465 = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass },
            connectionTimeout: 7000,
            tls: { rejectUnauthorized: false }
          });
          return await t465.sendMail(mailOptions);
        }
      }
    };
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

  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  let delivered = false;
  let deliveryError = null;

  // 1. Primary: Resend HTTPS API (Works 100% on Render Free Cloud without SMTP port blocking)
  if (resendApiKey) {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(resendApiKey);
      const fromAddr = process.env.FROM_EMAIL || 'AlumniConnect <onboarding@resend.dev>';
      const resendResult = await resend.emails.send({
        from: fromAddr,
        to: toEmail,
        subject,
        html
      });

      if (resendResult.error) {
        throw new Error(resendResult.error.message || 'Resend API dispatch error');
      }

      delivered = true;
      console.log(`✅ [RESEND API] 6-digit OTP delivered successfully to ${toEmail} (ID: ${resendResult.data?.id})`);
    } catch (err) {
      deliveryError = err.message;
      console.warn(`⚠️ [Resend API Failed]: ${err.message}. Trying SMTP fallback...`);
    }
  }

  // 2. Fallback: SMTP transporter (if Resend not configured or fails)
  if (!delivered) {
    const transporter = getTransporter();
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
        deliveryError = null;
        console.log(`✅ [SMTP Delivery] OTP delivered successfully to ${toEmail}`);
      } catch (err) {
        deliveryError = deliveryError ? `${deliveryError} | SMTP: ${err.message}` : err.message;
        console.error('❌ [SMTP Delivery Error]:', err.message);
      }
    }
  }

  return { delivered, deliveryError, devOtp: otp };
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

  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  let delivered = false;
  let deliveryError = null;

  if (resendApiKey) {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(resendApiKey);
      const fromAddr = process.env.FROM_EMAIL || 'AlumniConnect <onboarding@resend.dev>';
      await resend.emails.send({
        from: fromAddr,
        to: toEmail,
        subject,
        html
      });
      delivered = true;
    } catch (err) {
      deliveryError = err.message;
    }
  }

  if (!delivered) {
    const transporter = getTransporter();
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
        console.warn('⚠️ [SMTP Reset Password Delivery Failed]:', err.message);
      }
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

/**
 * Core email dispatcher with Resend HTTPS and SMTP fallback
 */
const dispatchEmail = async ({ toEmail, subject, html, text }) => {
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  let delivered = false;
  let deliveryError = null;

  // 1. Try Resend HTTPS API if configured
  if (resendApiKey) {
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
        return { delivered: true, provider: 'resend' };
      } else {
        deliveryError = resendResult.error.message || 'Resend error';
        console.warn(`⚠️ [Resend API Note for ${toEmail}]: ${deliveryError}. Trying SMTP fallback...`);
      }
    } catch (err) {
      deliveryError = err.message;
      console.warn(`⚠️ [Resend API Failed for ${toEmail}]: ${err.message}. Trying SMTP fallback...`);
    }
  }

  // 2. Fallback: SMTP Transporter (Gmail)
  if (!delivered) {
    const transporter = getTransporter();
    if (transporter) {
      try {
        const fromAddress = process.env.SMTP_FROM || `"AlumniConnect" <${process.env.SMTP_USER || 'bhofficialcollege@gmail.com'}>`;
        await transporter.sendMail({
          from: fromAddress,
          to: toEmail,
          subject,
          html,
          text
        });
        delivered = true;
        deliveryError = null;
        console.log(`✅ [SMTP Delivery] Email delivered successfully to ${toEmail} | Subject: "${subject}"`);
        return { delivered: true, provider: 'smtp' };
      } catch (err) {
        deliveryError = deliveryError ? `${deliveryError} | SMTP: ${err.message}` : err.message;
        console.error(`❌ [SMTP Delivery Error for ${toEmail}]:`, err.message);
      }
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
 * Send Email Notification to Mentor when a student requests a new session
 */
const sendSessionRequestEmailToMentor = async ({ mentor, student, topic, message, preferredDate }) => {
  if (!mentor || !mentor.email) {
    console.warn('⚠️ [sendSessionRequestEmailToMentor] No mentor email found');
    return { delivered: false, error: 'No mentor email' };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const mentorName = mentor.name || 'Alumni Mentor';
  const studentName = student?.name || 'Student Mentee';
  const studentEmail = student?.email || 'N/A';
  const branch = student?.branch || 'Engineering';
  const semester = student?.semester ? `Semester ${student.semester}` : '';
  const regNumber = student?.registrationNumber || student?.rollNumber || '';
  const formattedDate = formatFriendlyDate(preferredDate);

  const subject = `📬 New Mentorship Request from ${studentName}: "${topic}"`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0E121C; color: #FFFFFF; border-radius: 24px; padding: 36px 30px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">AlumniConnect</h1>
        <div style="display: inline-block; margin-top: 8px; padding: 4px 14px; border-radius: 9999px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3);">
          <span style="color: #38BDF8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">New 1-on-1 Session Request</span>
        </div>
      </div>

      <p style="color: #E2E8F0; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">Hello ${mentorName},</p>
      <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        You have received a new 1-on-1 mentorship session request on AlumniConnect. Below are the mentee's details and requested agenda:
      </p>

      <div style="background: #131826; border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 16px;">
        <p style="color: #38BDF8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0;">Student Mentee Details</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #CBD5E1;">
          <tr>
            <td style="padding: 5px 0; color: #94A3B8; width: 130px;"><strong>Name:</strong></td>
            <td style="padding: 5px 0; color: #FFFFFF; font-weight: 600;">${studentName}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #94A3B8;"><strong>Email:</strong></td>
            <td style="padding: 5px 0;"><a href="mailto:${studentEmail}" style="color: #38BDF8; text-decoration: none;">${studentEmail}</a></td>
          </tr>
          ${branch ? `
          <tr>
            <td style="padding: 5px 0; color: #94A3B8;"><strong>Academic Field:</strong></td>
            <td style="padding: 5px 0;">${branch} ${semester ? `(${semester})` : ''}</td>
          </tr>` : ''}
          ${regNumber ? `
          <tr>
            <td style="padding: 5px 0; color: #94A3B8;"><strong>Reg / Roll No:</strong></td>
            <td style="padding: 5px 0; font-family: monospace;">${regNumber}</td>
          </tr>` : ''}
        </table>
      </div>

      <div style="background: #131826; border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px;">
        <p style="color: #A855F7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0;">Session Request Agenda</p>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #94A3B8;"><strong style="color: #FFFFFF;">Topic:</strong> <span style="color: #FFFFFF; font-weight: 600;">${topic}</span></p>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #94A3B8;"><strong style="color: #FFFFFF;">Preferred Date / Time:</strong> <span style="color: #38BDF8; font-weight: 600;">${formattedDate}</span></p>
        <div style="background: rgba(0,0,0,0.25); border-radius: 10px; padding: 12px 14px; border: 1px solid rgba(255,255,255,0.05);">
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Student's Message / Note:</p>
          <p style="margin: 0; color: #E2E8F0; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${message || 'No additional note provided.'}</p>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0 20px 0;">
        <a href="${frontendUrl}/dashboard/mentor" style="display: inline-block; background: #2563EB; color: #FFFFFF; font-size: 14px; font-weight: 700; padding: 14px 34px; border-radius: 9999px; text-decoration: none; box-shadow: 0 10px 25px rgba(37,99,235,0.4);">
          Review & Schedule in Dashboard →
        </a>
      </div>

      <p style="color: #64748B; font-size: 12px; line-height: 1.5; text-align: center; margin: 0 0 16px 0;">
        You can accept, select an exact meeting time, provide a Google Meet / Zoom link, or decline if unavailable.
      </p>

      <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 24px; padding-top: 18px; text-align: center; font-size: 11px; color: #64748B;">
        © ${new Date().getFullYear()} AlumniConnect Mentorship Platform. All rights reserved.
      </div>
    </div>
  `;

  return await dispatchEmail({ toEmail: mentor.email, subject, html });
};

/**
 * Send Email Notification to Student when a mentor Approves or Rejects their session
 */
const sendSessionStatusEmailToStudent = async ({ student, mentor, status, topic, scheduledDate, mentorNotes }) => {
  if (!student || !student.email) {
    console.warn('⚠️ [sendSessionStatusEmailToStudent] No student email found');
    return { delivered: false, error: 'No student email' };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const studentName = student?.name || 'Student Mentee';
  const mentorName = mentor?.name || 'Alumni Mentor';
  const mentorCompany = mentor?.company || mentor?.domain || 'Industry Alumnus';
  const formattedDate = formatFriendlyDate(scheduledDate);
  const isApproved = status === 'approved';

  const subject = isApproved
    ? `🎉 Session Approved: Your 1-on-1 Mentorship with ${mentorName} is Confirmed!`
    : `Update on your Mentorship Session Request with ${mentorName}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0E121C; color: #FFFFFF; border-radius: 24px; padding: 36px 30px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">AlumniConnect</h1>
        <div style="display: inline-block; margin-top: 8px; padding: 4px 14px; border-radius: 9999px; background: ${isApproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; border: 1px solid ${isApproved ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'};">
          <span style="color: ${isApproved ? '#34D399' : '#FB7185'}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
            ${isApproved ? 'Session Confirmed & Scheduled' : 'Session Status Update'}
          </span>
        </div>
      </div>

      <p style="color: #E2E8F0; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">Hello ${studentName},</p>
      
      ${isApproved ? `
      <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        Great news! Your 1-on-1 mentorship session request with alumni mentor <strong style="color: #FFFFFF;">${mentorName}</strong> (${mentorCompany}) has been <span style="color: #34D399; font-weight: 700;">APPROVED</span>!
      </p>

      <div style="background: #131826; border-radius: 16px; padding: 22px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px;">
        <p style="color: #34D399; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px 0;">Confirmed Session Details</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #CBD5E1;">
          <tr>
            <td style="padding: 6px 0; color: #94A3B8; width: 140px;"><strong>Alumni Mentor:</strong></td>
            <td style="padding: 6px 0; color: #FFFFFF; font-weight: 600;">${mentorName} <span style="color: #38BDF8; font-weight: normal;">(${mentorCompany})</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94A3B8;"><strong>Topic:</strong></td>
            <td style="padding: 6px 0; color: #FFFFFF; font-weight: 600;">${topic}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94A3B8;"><strong>Scheduled Time:</strong></td>
            <td style="padding: 6px 0; color: #38BDF8; font-weight: 700; font-size: 14px;">${formattedDate}</td>
          </tr>
        </table>

        ${mentorNotes ? `
        <div style="margin-top: 16px; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 14px; border: 1px solid rgba(56, 189, 248, 0.2);">
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #38BDF8; font-weight: 700; text-transform: uppercase;">Meeting Instructions / Link / Notes:</p>
          <p style="margin: 0; color: #F1F5F9; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${mentorNotes}</p>
        </div>` : ''}
      </div>

      <div style="text-align: center; margin: 28px 0 20px 0;">
        <a href="${frontendUrl}/dashboard/student" style="display: inline-block; background: #2563EB; color: #FFFFFF; font-size: 14px; font-weight: 700; padding: 14px 34px; border-radius: 9999px; text-decoration: none; box-shadow: 0 10px 25px rgba(37,99,235,0.4);">
          View in Student Dashboard →
        </a>
      </div>

      <p style="color: #94A3B8; font-size: 12px; line-height: 1.5; text-align: center;">
        💡 <strong>Tip:</strong> Join on time with your questions and notes ready to maximize your session.
      </p>
      ` : `
      <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for requesting mentorship with <strong style="color: #FFFFFF;">${mentorName}</strong> on AlumniConnect. Unfortunately, your session request for the topic <strong style="color: #FFFFFF;">"${topic}"</strong> could not be accommodated at this time.
      </p>

      <div style="background: #131826; border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #E2E8F0; line-height: 1.6;">
          Our alumni mentors are working professionals who may occasionally have scheduling conflicts, travel commitments, or full capacity.
        </p>
        <p style="margin: 0; font-size: 13px; color: #94A3B8; line-height: 1.6;">
          Please feel free to connect with other verified alumni mentors or request an alternative slot.
        </p>
      </div>

      <div style="text-align: center; margin: 28px 0 20px 0;">
        <a href="${frontendUrl}/dashboard/student" style="display: inline-block; background: #2563EB; color: #FFFFFF; font-size: 14px; font-weight: 700; padding: 14px 34px; border-radius: 9999px; text-decoration: none; box-shadow: 0 10px 25px rgba(37,99,235,0.4);">
          Find Another Alumni Mentor →
        </a>
      </div>
      `}

      <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 24px; padding-top: 18px; text-align: center; font-size: 11px; color: #64748B;">
        © ${new Date().getFullYear()} AlumniConnect Mentorship Platform. All rights reserved.
      </div>
    </div>
  `;

  return await dispatchEmail({ toEmail: student.email, subject, html });
};

module.exports = {
  sendEmailVerificationOtp,
  sendPasswordResetOtp,
  sendContactNotificationEmail,
  sendSessionRequestEmailToMentor,
  sendSessionStatusEmailToStudent,
};
