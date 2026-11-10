import nodemailer from 'nodemailer';

export interface EmailTemplateData {
  cityName: string;
  aqi: number;
  category: string;
  categoryColor?: string;
  dominantPollutant?: string;
  pm25?: number;
  recommendations?: {
    outdoorExercise?: string;
    ventilation?: string;
    maskRequired?: boolean;
    airPurifier?: string;
  };
  triggerReason?: string;
  appUrl?: string;
}

function generateAqiAlertHtml(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const city = data.cityName || 'Your Tracked City';
  const aqi = data.aqi || 175;
  const category = data.category || 'Unhealthy';
  const color = data.categoryColor || '#C53030';
  const dominant = data.dominantPollutant || 'PM2.5';
  const pm25Val = data.pm25 !== undefined ? `${data.pm25} µg/m³` : 'Elevated';
  const appUrl = data.appUrl || 'https://breath-ai-six.vercel.app/';
  const exercise = data.recommendations?.outdoorExercise || (aqi > 150 ? 'Avoid strenuous outdoor cardio and running. Exercise in a filtered indoor space.' : 'Reduce intense prolonged outdoor exertion.');
  const ventilation = data.recommendations?.ventilation || (aqi > 150 ? 'Keep exterior doors and windows sealed to prevent outdoor smog penetration.' : 'Keep windows closed during morning rush-hour peaks.');
  const maskAdvice = data.recommendations?.maskRequired !== false ? 'Certified N95 / FFP2 respirator strongly advised outdoors with tight nose seal.' : 'Mask optional for general population under current levels.';
  const purifier = data.recommendations?.airPurifier || 'Run True HEPA air purifier on High/Auto in bedrooms and common living areas.';
  const triggerReason = data.triggerReason || `Real-time AQI crossed threshold (${aqi} AQI - ${category})`;

  const subject = `⚠️ Air Quality Alert: ${city} is currently ${category} (AQI ${aqi})`;

  const text = `BreatheAI Alert: Air Quality Warning for ${city}
AQI: ${aqi} (${category})
Dominant Pollutant: ${dominant} (${pm25Val})
Reason: ${triggerReason}

Health Recommendations:
• Outdoor Activity: ${exercise}
• Mask Protocol: ${maskAdvice}
• Home Ventilation: ${ventilation}
• HEPA Filtration: ${purifier}

View live telemetry & 5-day forecast on BreatheAI: ${appUrl}
— BreatheAI Environmental Intelligence`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F5ED; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #26332D;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F7F5ED; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E3E6DC; box-shadow: 0 10px 25px rgba(23, 61, 50, 0.08);">
          <tr>
            <td style="background-color: #173D32; padding: 24px 28px; text-align: left;">
              <span style="display: inline-block; font-size: 20px; font-weight: 800; color: #FFFFFF;">🌿 Breathe<span style="color: #65B9C9;">AI</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #173D32;">${city} AQI Warning</h1>
              <p style="font-size: 48px; font-weight: 900; color: ${color}; margin: 8px 0;">${aqi} <span style="font-size: 18px;">${category}</span></p>
              <p style="color: #4A5568; font-size: 14px;"><strong>Dominant:</strong> ${dominant} (${pm25Val}) &bull; ${triggerReason}</p>
              <div style="margin-top: 18px; padding: 14px; background-color: #F7F5ED; border-radius: 10px; font-size: 13px; color: #2D3748;">
                <p style="margin: 4px 0;"><strong>Cardio:</strong> ${exercise}</p>
                <p style="margin: 4px 0;"><strong>Mask:</strong> ${maskAdvice}</p>
                <p style="margin: 4px 0;"><strong>Ventilation:</strong> ${ventilation}</p>
              </div>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${appUrl}" style="background-color: #173D32; color: #FFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">Open Live Dashboard &rarr;</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let payload: any;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const toEmail = payload?.toEmail?.trim();
  if (!toEmail || !toEmail.includes('@')) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'A valid email address is required.' })
    };
  }

  const host = process.env.SMTP_HOST || 'mail.thesoulmate.in';
  const defaultPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'no-reply@thesoulmate.in';
  const pass = process.env.SMTP_PASS || '3122002@Riju';
  const from = process.env.SMTP_FROM || `"BreatheAI Alerts" <${user}>`;

  const { subject, html, text } = generateAqiAlertHtml(payload);
  const candidatePorts = defaultPort === 465 ? [465, 587] : [587, 465];
  let lastError: any = null;

  for (const port of candidatePorts) {
    try {
      const isSsl = port === 465;
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSsl,
        auth: { user, pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
        tls: { rejectUnauthorized: false }
      });

      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject,
        text,
        html
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, messageId: info.messageId, recipient: toEmail, portUsed: port })
      };
    } catch (err: any) {
      lastError = err;
    }
  }

  return {
    statusCode: 500,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      error: 'Failed to send alert email via SMTP',
      details: lastError?.message || 'SMTP timeout or auth error'
    })
  };
};
