import nodemailer from 'nodemailer';
import { generateAqiAlertHtml, EmailTemplateData } from '../../src/utils/alertEmailTemplate';

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let payload: EmailTemplateData & { toEmail?: string };
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const toEmail = payload.toEmail?.trim();
  if (!toEmail || !toEmail.includes('@')) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'A valid email address is required.' })
    };
  }

  const host = process.env.SMTP_HOST || 'mail.thesoulmate.in';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'no-reply@thesoulmate.in';
  const pass = process.env.SMTP_PASS || '3122002@Riju';
  const from = process.env.SMTP_FROM || `"BreatheAI Alerts" <${user}>`;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    const { subject, html, text } = generateAqiAlertHtml(payload);

    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      text,
      html
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, messageId: info.messageId })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to send alert email', details: err?.message || 'SMTP error' })
    };
  }
};
