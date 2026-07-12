import nodemailer from 'nodemailer';
import logger from '../config/logger.js';
import dns from 'dns/promises';

// List of common disposable/temporary email domains to prevent quick fake registrations
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'yopmail.com',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
  'temp-mail.org',
]);

const checkOffline = async () => {
  try {
    const addresses = await dns.resolve('google.com');
    return !addresses || addresses.length === 0;
  } catch (err) {
    return true;
  }
};

/**
 * Validates the email domain via DNS check and verifies it is not a disposable domain.
 * @param {string} email
 * @returns {Promise<boolean>} True if valid, false otherwise.
 */
export const validateEmailDomain = async (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return false;
  }
  const domain = email.split('@')[1];
  if (!domain) {
    return false;
  }

  const domainLower = domain.toLowerCase().trim();
  if (DISPOSABLE_DOMAINS.has(domainLower)) {
    logger.warn(`Email validation failed: ${email} is from a blacklisted disposable domain.`);
    return false;
  }

  try {
    // Resolve MX (Mail Exchange) records
    const mx = await dns.resolveMx(domainLower);
    if (mx && mx.length > 0) {
      return true;
    }
  } catch (err) {
    // Fallback: Check standard A records if MX doesn't exist (some domains fall back to A records for mail)
    try {
      const addresses = await dns.resolve(domainLower);
      if (addresses && addresses.length > 0) {
        return true;
      }
    } catch (err2) {
      // If resolving failed, verify if it was because we are offline.
      // We only allow lookup failures if the server is genuinely offline.
      const isOffline = await checkOffline();
      if (isOffline) {
        logger.warn(`DNS lookup failed for domain "${domain}" (${err2.message}) but allowed because the system appears to be offline.`);
        return true;
      }
      logger.warn(`Email validation failed: DNS lookup failed for domain "${domain}" (${err2.message}).`);
      return false;
    }
  }
  return false;
};


// Create SMTP Transporter
const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    logger.warn('Nodemailer SMTP email credentials are not configured in .env. Will fall back to terminal logging for OTPs.');
    return null;
  }

  return nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass,
    },
  });
};

export const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || '"Review Wallah" <no-reply@reviewwallah.me>';

  const mailOptions = {
    from: from,
    to: email,
    subject: 'Review Wallah - Password Reset Verification Code',
    text: `Your password reset OTP is ${otp}. It is valid for 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px; margin: auto;">
        <h2 style="color: #4d70ff; text-align: center;">Review Wallah</h2>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p>Dear Student,</p>
        <p>You requested a password reset. Please use the following One-Time Password (OTP) to reset your password. This OTP is valid for <strong>15 minutes</strong>.</p>
        <div style="font-size: 24px; font-weight: bold; text-align: center; color: #4d70ff; background-color: #f5f7ff; padding: 15px; border-radius: 8px; letter-spacing: 4px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 12px; text-align: center;">If you did not request this reset, please ignore this email.</p>
      </div>
    `,
  };

  if (!transporter) {
    // Development simulator fallback
    console.log('\n=============================================');
    console.log(`[EMAIL SIMULATOR] Sending OTP to: ${email}`);
    console.log(`[EMAIL SIMULATOR] Verification OTP: ${otp}`);
    console.log('=============================================\n');
    return true;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`OTP Email successfully sent to ${email}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Error sending email to ${email}: ${error.message}`);
    // Also output simulator fallback in console so developers can proceed if send fails
    console.log('\n=============================================');
    console.log(`[EMAIL FALLBACK] Sending OTP to: ${email}`);
    console.log(`[EMAIL FALLBACK] Verification OTP: ${otp}`);
    console.log('=============================================\n');
    return false;
  }
};

export const sendSupportTicketEmail = async (ticket) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || '"Review Wallah" <no-reply@reviewwallah.me>';
  const adminEmail = process.env.ADMIN_EMAIL; // Recipient admin email address requested by user
  const adminEmail1 = process.env.ADMIN_EMAIL1; // Additional admin email address
  let detailsHtml = '';
  const details = ticket.messageDetails || {};

  if (ticket.category === 'listing') {
    detailsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: bold; color: #4b5563; font-size: 13px; width: 35%;">Place Name:</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 13px;">${details.placeName || 'N/A'} (${details.placeType || 'N/A'})</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: bold; color: #4b5563; font-size: 13px;">Listing URL:</td>
          <td style="padding: 10px 0; color: #2563eb; font-size: 13px;"><a href="${details.link || '#'}" style="color: #2563eb; text-decoration: underline;">${details.link || 'N/A'}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: bold; color: #4b5563; font-size: 13px;">Owner Name:</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 13px;">${details.ownerName || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: bold; color: #4b5563; font-size: 13px;">Owner Email:</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 13px;">${details.ownerEmail || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: bold; color: #4b5563; font-size: 13px;">Owner Mobile:</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 13px;">${details.ownerMobile || 'N/A'}</td>
        </tr>
      </table>
      <div style="margin-top: 20px; border-left: 4px solid #f59e0b; padding: 15px; font-size: 13px; line-height: 1.6; color: #4b5563; background-color: #fffbeb; border-radius: 0 8px 8px 0;">
        <h4 style="margin: 0 0 8px 0; color: #b45309; font-size: 14px; font-weight: bold;">Report / Correction Details</h4>
        ${(details.issueDescription || 'No details provided.').replace(/\n/g, '<br/>')}
      </div>
    `;
  } else if (ticket.category === 'partnership') {
    detailsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: bold; color: #4b5563; font-size: 13px; width: 35%;">Company / Org:</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 13px;">${details.companyName || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: bold; color: #4b5563; font-size: 13px;">Contact Number:</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 13px;">${details.contactPhone || 'N/A'}</td>
        </tr>
      </table>
      <div style="margin-top: 20px; border-left: 4px solid #3b82f6; padding: 15px; font-size: 13px; line-height: 1.6; color: #4b5563; background-color: #eff6ff; border-radius: 0 8px 8px 0;">
        <h4 style="margin: 0 0 8px 0; color: #1d4ed8; font-size: 14px; font-weight: bold;">Partnership Proposal</h4>
        ${(details.proposalDetails || 'No details provided.').replace(/\n/g, '<br/>')}
      </div>
    `;
  } else {
    detailsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: bold; color: #4b5563; font-size: 13px; width: 35%;">Subject / Topic:</td>
          <td style="padding: 10px 0; color: #1f2937; font-size: 13px; font-weight: bold;">${details.subject || 'N/A'}</td>
        </tr>
      </table>
      <div style="margin-top: 20px; border-left: 4px solid #06b6d4; padding: 15px; font-size: 13px; line-height: 1.6; color: #4b5563; background-color: #ecfeff; border-radius: 0 8px 8px 0;">
        <h4 style="margin: 0 0 8px 0; color: #0891b2; font-size: 14px; font-weight: bold;">Message Context</h4>
        ${(details.message || 'No message provided.').replace(/\n/g, '<br/>')}
      </div>
    `;
  }

  let badgeColor = '#06b6d4';
  let categoryName = 'General Support';
  if (ticket.category === 'listing') {
    badgeColor = '#f59e0b';
    categoryName = 'Listing Abuse / Correction';
  } else if (ticket.category === 'partnership') {
    badgeColor = '#3b82f6';
    categoryName = 'Partnership / Collab';
  }

  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 30px 15px; color: #374151; min-height: 100%;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
        
        <!-- Header -->
        <div style="background-color: #15152e; padding: 25px; text-align: center; border-bottom: 2px solid #2a2a3d;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">REVIEW WALLAH HUB</h2>
          <span style="display: inline-block; margin-top: 8px; font-size: 10px; font-weight: bold; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px;">Admin Support Portal</span>
        </div>

        <!-- Body Content -->
        <div style="padding: 30px;">
          
          <!-- Category Badge & Title -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f3f4f6; padding-bottom: 15px; margin-bottom: 20px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #9ca3af; letter-spacing: 0.5px;">Ticket Category:</span>
            <span style="background-color: ${badgeColor}; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${categoryName}
            </span>
          </div>

          <!-- Subject -->
          <div style="margin: 20px 0;">
            <h3 style="margin: 0; font-size: 18px; color: #111827; font-weight: 850; line-height: 1.4;">${ticket.subject}</h3>
            <span style="font-size: 11px; color: #9ca3af; display: block; margin-top: 4px;">Submitted on ${new Date(ticket.createdAt).toLocaleString()}</span>
          </div>

          <!-- Sender Details Card -->
          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 15px; border-radius: 12px; margin-bottom: 25px;">
            <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #9ca3af; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Sender Information</span>
            <div style="display: flex; align-items: center;">
              <div style="width: 36px; height: 36px; background-color: #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #4b5563; font-size: 14px; margin-right: 12px; flex-shrink: 0;">
                ${ticket.senderName ? ticket.senderName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <span style="font-size: 13px; font-weight: bold; color: #1f2937; display: block;">${ticket.senderName}</span>
                <span style="font-size: 11px; color: #6b7280; display: block;">${ticket.senderEmail}</span>
              </div>
            </div>
          </div>

          <!-- Structured Form Details -->
          <div style="margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; font-weight: bold; color: #9ca3af; letter-spacing: 0.5px; border-bottom: 1px solid #f3f4f6; padding-bottom: 6px;">Ticket Details</h4>
            ${detailsHtml}
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #9ca3af; font-weight: 600;">This is an automated support notification from your Review Wallah server.</p>
          <p style="margin: 8px 0 0 0; font-size: 11px;"><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" style="color: #4f46e5; text-decoration: none; font-weight: bold;">Go to Admin Control Panel &rarr;</a></p>
        </div>

      </div>
    </div>
  `;

  const mailOptions = {
    from: from,
    to: adminEmail,
    cc: adminEmail1,
    subject: `[Review Wallah Support] ${ticket.subject}`,
    text: ticket.messageText,
    html: htmlBody,
  };

  if (!transporter) {
    console.log('\n=============================================');
    console.log(`[EMAIL SIMULATOR] Sending Ticket Email to Admin: ${adminEmail}`);
    console.log(`[EMAIL SIMULATOR] Subject: ${ticket.subject}`);
    console.log(`[EMAIL SIMULATOR] Message: \n${ticket.messageText}`);
    console.log('=============================================\n');
    return true;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Support ticket email successfully sent to admin ${adminEmail}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Error sending support ticket email to admin: ${error.message}`);
    return false;
  }
};
