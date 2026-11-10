import type { IncomingMessage, ServerResponse } from 'http';
import nodemailer from 'nodemailer';
import { generateAqiAlertHtml, EmailTemplateData } from '../src/utils/alertEmailTemplate';

export default async function handler(req: IncomingMessage & { body?: any; query?: any }, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  // Parse body if not pre-parsed
  let payload: EmailTemplateData & { toEmail?: string };
  try {
    if (typeof req.body === 'object' && req.body !== null) {
      payload = req.body;
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const raw = Buffer.concat(chunks).toString('utf-8');
      payload = JSON.parse(raw || '{}');
    }
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid JSON request body.' }));
    return;
  }

  const toEmail = payload.toEmail?.trim();
  if (!toEmail || !toEmail.includes('@')) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'A valid recipient email address is required.' }));
    return;
  }

  const host = process.env.SMTP_HOST || 'mail.thesoulmate.in';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && (port === 465 || port === 587);
  const user = process.env.SMTP_USER || 'no-reply@thesoulmate.in';
  const pass = process.env.SMTP_PASS || '3122002@Riju';
  const from = process.env.SMTP_FROM || `"BreatheAI Alerts" <${user}>`;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // SSL on 465, TLS/STARTTLS on 587
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false // Avoid self-signed certificate rejection
      }
    });

    const { subject, html, text } = generateAqiAlertHtml(payload);

    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      text,
      html
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      messageId: info.messageId,
      recipient: toEmail
    }));
  } catch (err: any) {
    console.error('SMTP email alert dispatch error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Failed to dispatch email via SMTP server.',
      details: err?.message || 'Unknown SMTP error'
    }));
  }
}
