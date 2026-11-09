import { CurrentAirQuality, LocationData } from '../types/aqi';

// Backward-compatible cross-browser rounded rectangle
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === 'function') {
    try {
      ctx.roundRect(x, y, width, height, radius);
      return;
    } catch {
      // Fallback if parameter mismatch
    }
  }
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

export async function generateSocialCardPng(
  location: LocationData | null | undefined,
  current: CurrentAirQuality | null | undefined
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630; // 1.91:1 standard social ratio
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const locName = location?.name || 'Selected City';
  const locDisplay = location?.displayName || locName;
  const aqi = current?.aqi ?? 150;
  const category = current?.category || 'Moderate';
  const categoryColor = current?.categoryInfo?.color || '#C08532';
  const dominant = current?.dominantPollutant || 'PM2.5';

  const pm25 = current?.pollutants?.pm2_5?.value ?? 0;
  const pm25Ratio = current?.pollutants?.pm2_5?.ratioToWho ?? 1;
  const pm10 = current?.pollutants?.pm10?.value ?? 0;
  const pm10Ratio = current?.pollutants?.pm10?.ratioToWho ?? 1;
  const no2 = current?.pollutants?.no2?.value ?? 0;
  const no2Ratio = current?.pollutants?.no2?.ratioToWho ?? 1;
  const o3 = current?.pollutants?.o3?.value ?? 0;
  const o3Ratio = current?.pollutants?.o3?.ratioToWho ?? 1;

  // Background: Deep Forest Green (#173D32)
  ctx.fillStyle = '#173D32';
  ctx.fillRect(0, 0, 1200, 630);

  // Subtle border in Sage Green (#A8B99A)
  ctx.strokeStyle = 'rgba(168, 185, 154, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 1136, 566);

  // Top Tag
  ctx.fillStyle = '#245543';
  ctx.beginPath();
  drawRoundRect(ctx, 64, 60, 460, 40, 20);
  ctx.fill();

  ctx.font = '600 15px "Manrope", sans-serif';
  ctx.fillStyle = '#F7F5ED';
  ctx.fillText('🌿 BREATHEAI • NATURE × TECHNOLOGY INTELLIGENCE', 84, 85);

  // City Headline
  ctx.font = 'bold 44px "Manrope", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(locName, 64, 155);

  ctx.font = '500 17px "Inter", sans-serif';
  ctx.fillStyle = '#A8B99A';
  ctx.fillText(`${locDisplay} • ${new Date().toLocaleDateString([], { dateStyle: 'full' })}`, 64, 190);

  // AQI Container Box (Left)
  const aqiX = 64;
  const aqiY = 225;
  const aqiW = 460;
  const aqiH = 300;

  ctx.fillStyle = '#245543';
  ctx.beginPath();
  drawRoundRect(ctx, aqiX, aqiY, aqiW, aqiH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(168, 185, 154, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '600 15px "Manrope", sans-serif';
  ctx.fillStyle = '#A8B99A';
  ctx.fillText('US AIR QUALITY INDEX (AQI)', aqiX + 32, aqiY + 45);

  ctx.font = '800 100px "JetBrains Mono", monospace';
  ctx.fillStyle = categoryColor;
  ctx.fillText(String(aqi), aqiX + 32, aqiY + 160);

  ctx.font = 'bold 26px "Manrope", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(category, aqiX + 32, aqiY + 220);

  ctx.font = '500 15px "Inter", sans-serif';
  ctx.fillStyle = '#F7F5ED';
  ctx.fillText(`Dominant Driver: ${dominant}`, aqiX + 32, aqiY + 260);

  // Pollutants Column (Right)
  const pX = 550;
  const pY = 225;
  const pW = 586;
  const pH = 300;

  ctx.fillStyle = '#245543';
  ctx.beginPath();
  drawRoundRect(ctx, pX, pY, pW, pH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(168, 185, 154, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '600 15px "Manrope", sans-serif';
  ctx.fillStyle = '#65B9C9';
  ctx.fillText('Atmospheric Telemetry vs WHO Safety Thresholds', pX + 32, pY + 45);

  const list = [
    { label: 'PM2.5 (Fine Particulates)', val: `${pm25} µg/m³`, ratio: `${pm25Ratio}x WHO Limit` },
    { label: 'PM10 (Coarse Inhalables)', val: `${pm10} µg/m³`, ratio: `${pm10Ratio}x WHO Limit` },
    { label: 'NO₂ (Combustion Gas)', val: `${no2} µg/m³`, ratio: `${no2Ratio}x WHO Limit` },
    { label: 'O₃ (Ground-Level Ozone)', val: `${o3} µg/m³`, ratio: `${o3Ratio}x WHO Limit` }
  ];

  let curY = pY + 95;
  for (const item of list) {
    ctx.font = '500 16px "Inter", sans-serif';
    ctx.fillStyle = '#F7F5ED';
    ctx.fillText(item.label, pX + 32, curY);

    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(item.val, pX + 330, curY);

    ctx.font = '500 13px "Inter", sans-serif';
    ctx.fillStyle = item.ratio.includes('x') && parseFloat(item.ratio) > 2 ? '#E2847A' : '#65B9C9';
    ctx.fillText(`(${item.ratio})`, pX + 460, curY);

    curY += 46;
  }

  // Footer Credit
  ctx.font = '400 14px "Inter", sans-serif';
  ctx.fillStyle = '#A8B99A';
  ctx.fillText('BreatheAI • Real-Time DPCC / CPCB & Open-Meteo Telemetry • Breathe Smarter. Live Better.', 64, 565);

  return canvas.toDataURL('image/png');
}

export function generateShareText(
  location: LocationData | null | undefined,
  current: CurrentAirQuality | null | undefined,
  url = 'https://breath-ai-six.vercel.app/'
): string {
  const locName = location?.name || 'My Location';
  const aqi = current?.aqi ?? 150;
  const category = current?.category || 'Moderate';
  const dominant = current?.dominantPollutant || 'PM2.5';
  const pm25Val = current?.pollutants?.pm2_5?.value ?? 0;
  const pm25Ratio = current?.pollutants?.pm2_5?.ratioToWho ?? 1;
  const advice = current?.categoryInfo?.description || 'Stay aware of outdoor air quality.';

  return `🌿 BreatheAI Air Quality Report for ${locName}:\n` +
    `• Real-Time AQI: ${aqi} (${category})\n` +
    `• Dominant Pollutant: ${dominant} (${pm25Val} µg/m³, ${pm25Ratio}x WHO limit)\n` +
    `• Health Advice: ${advice}\n\n` +
    `Check live telemetry & 5-day forecast on BreatheAI: ${url}\n` +
    `#BreatheAI #AirQuality #AQI #${locName.replace(/\s+/g, '')}`;
}
