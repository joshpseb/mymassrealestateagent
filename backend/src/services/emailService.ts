import nodemailer from 'nodemailer';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeMultilineText = (value: string): string =>
  value
    .split('\n')
    .map((line) => escapeHtml(line))
    .join('<br/>');

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

interface InquiryLike {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  propertyAddress?: string | null;
  createdAt?: Date | string;
}

export const sendInquiryNotification = async (inquiry: InquiryLike) => {
  const transporter = createTransporter();
  const recipient = process.env.AGENT_EMAIL || process.env.SMTP_USER;

  if (!transporter || !recipient) {
    return;
  }

  const submittedAt = inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString() : new Date().toLocaleString();
  const safeName = escapeHtml(inquiry.name);
  const safeEmail = escapeHtml(inquiry.email);
  const safePhone = escapeHtml(inquiry.phone || 'Not provided');
  const safeProperty = escapeHtml(inquiry.propertyAddress || 'General inquiry');
  const safeSubmittedAt = escapeHtml(submittedAt);
  const safeMessage = escapeMultilineText(inquiry.message);

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: recipient,
    subject: `New inquiry from ${safeName.replace(/(\r|\n)/g, ' ')}`,
    html: `
      <h2>New Inquiry Received</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Phone:</strong> ${safePhone}</p>
      <p><strong>Property:</strong> ${safeProperty}</p>
      <p><strong>Submitted:</strong> ${safeSubmittedAt}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `,
  });
};
