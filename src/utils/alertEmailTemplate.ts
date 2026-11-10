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

export function generateAqiAlertHtml(data: EmailTemplateData): { subject: string; html: string; text: string } {
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
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #173D32; padding: 24px 28px; text-align: left;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">🌿 Breathe<span style="color: #65B9C9;">AI</span></span>
                    <span style="display: block; font-size: 11px; color: #A8B99A; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px; font-weight: 600;">Environmental Health Telemetry</span>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(255,255,255,0.12); color: #F7F5ED; font-size: 11px; padding: 5px 12px; border-radius: 99px; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);">LIVE ALERT</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- City & Status Hero -->
          <tr>
            <td style="padding: 28px 28px 12px 28px;">
              <p style="margin: 0; font-size: 13px; color: #58645C; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Location Warning</p>
              <h1 style="margin: 6px 0 0 0; font-size: 26px; font-weight: 800; color: #173D32; letter-spacing: -0.5px;">${city}</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #718096;">Triggered: ${triggerReason}</p>
            </td>
          </tr>

          <!-- AQI Callout Box -->
          <tr>
            <td style="padding: 12px 28px 20px 28px;">
              <div style="background-color: #F7F5ED; border-radius: 16px; border: 1.5px solid ${color}40; padding: 20px; text-align: center;">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center">
                      <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #58645C; letter-spacing: 1px; display: block;">Air Quality Index (AQI)</span>
                      <span style="font-size: 64px; font-weight: 900; color: ${color}; line-height: 1.1; font-family: 'SF Mono', Consolas, Monaco, monospace; display: block; margin: 4px 0;">${aqi}</span>
                      <span style="display: inline-block; background-color: ${color}; color: #FFFFFF; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px;">${category}</span>
                    </td>
                  </tr>
                </table>
                <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #E3E6DC; font-size: 12px; color: #4A5568;">
                  <strong>Dominant Driver:</strong> ${dominant} &bull; <strong>Fine PM2.5:</strong> ${pm25Val}
                </div>
              </div>
            </td>
          </tr>

          <!-- Clinical Precautions -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <h2 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 800; color: #173D32; text-transform: uppercase; letter-spacing: 0.5px;">Physician-Backed Precautions</h2>
              
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <div style="background-color: #FFFFFF; border: 1px solid #E3E6DC; border-radius: 12px; padding: 12px 14px;">
                      <strong style="color: #173D32; font-size: 13px; display: block;">🏃 Outdoor Movement & Cardio</strong>
                      <span style="color: #4A5568; font-size: 12px; line-height: 1.4; display: block; margin-top: 3px;">${exercise}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <div style="background-color: #FFFFFF; border: 1px solid #E3E6DC; border-radius: 12px; padding: 12px 14px;">
                      <strong style="color: #173D32; font-size: 13px; display: block;">😷 Certified Mask Protocol</strong>
                      <span style="color: #4A5568; font-size: 12px; line-height: 1.4; display: block; margin-top: 3px;">${maskAdvice}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <div style="background-color: #FFFFFF; border: 1px solid #E3E6DC; border-radius: 12px; padding: 12px 14px;">
                      <strong style="color: #173D32; font-size: 13px; display: block;">🏠 Indoor Air & Filtration</strong>
                      <span style="color: #4A5568; font-size: 12px; line-height: 1.4; display: block; margin-top: 3px;">${ventilation} ${purifier}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 8px 28px 28px 28px; text-align: center;">
              <a href="${appUrl}" target="_blank" style="display: inline-block; background-color: #173D32; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(23,61,50,0.25);">
                Open Live Telemetry on BreatheAI &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #EEF1E8; padding: 20px 28px; text-align: center; border-top: 1px solid #E3E6DC; font-size: 11px; color: #718096; line-height: 1.5;">
              <p style="margin: 0;">This automated alert was dispatched by <strong>BreatheAI</strong> using authentic ground sensor telemetry from CPCB, DPCC & Open-Meteo.</p>
              <p style="margin: 8px 0 0 0;">You received this because you subscribed to smart AQI threshold alerts.</p>
              <p style="margin: 4px 0 0 0; color: #A0AEC0;">&copy; 2026 BreatheAI &bull; Breathe Smarter. Live Better.</p>
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
