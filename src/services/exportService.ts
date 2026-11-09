import { CurrentAirQuality, LocationData } from '../types/aqi';

export async function generateSocialCardPng(
  location: LocationData,
  current: CurrentAirQuality
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630; // 1.91:1 standard social ratio
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

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
  ctx.roundRect(64, 60, 440, 38, 19);
  ctx.fill();

  ctx.font = '600 15px "Manrope", sans-serif';
  ctx.fillStyle = '#F7F5ED';
  ctx.fillText('🌿 BREATHEAI • NATURE × TECHNOLOGY', 84, 84);

  // City Headline
  ctx.font = 'bold 44px "Manrope", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(location.name, 64, 155);

  ctx.font = '500 18px "Inter", sans-serif';
  ctx.fillStyle = '#A8B99A';
  ctx.fillText(`${location.displayName} • ${new Date().toLocaleDateString([], { dateStyle: 'full' })}`, 64, 190);

  // AQI Container Box (Left)
  const aqiX = 64;
  const aqiY = 225;
  const aqiW = 460;
  const aqiH = 300;

  ctx.fillStyle = '#245543';
  ctx.beginPath();
  ctx.roundRect(aqiX, aqiY, aqiW, aqiH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(168, 185, 154, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '600 15px "Manrope", sans-serif';
  ctx.fillStyle = '#A8B99A';
  ctx.fillText('US AIR QUALITY INDEX (AQI)', aqiX + 32, aqiY + 45);

  ctx.font = '800 100px "JetBrains Mono", monospace';
  ctx.fillStyle = current.categoryInfo.color;
  ctx.fillText(String(current.aqi), aqiX + 32, aqiY + 160);

  ctx.font = 'bold 26px "Manrope", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(current.category, aqiX + 32, aqiY + 220);

  ctx.font = '500 15px "Inter", sans-serif';
  ctx.fillStyle = '#F7F5ED';
  ctx.fillText(`Dominant Driver: ${current.dominantPollutant}`, aqiX + 32, aqiY + 260);

  // Pollutants Column (Right)
  const pX = 550;
  const pY = 225;
  const pW = 586;
  const pH = 300;

  ctx.fillStyle = '#245543';
  ctx.beginPath();
  ctx.roundRect(pX, pY, pW, pH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(168, 185, 154, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '600 15px "Manrope", sans-serif';
  ctx.fillStyle = '#65B9C9';
  ctx.fillText('Atmospheric Sensor Telemetry vs WHO Guidelines', pX + 32, pY + 45);

  const list = [
    { label: 'PM2.5 (Fine Particulates)', val: `${current.pollutants.pm2_5?.value || 0} µg/m³`, ratio: `${current.pollutants.pm2_5?.ratioToWho || 1}x WHO Limit` },
    { label: 'PM10 (Coarse Inhalables)', val: `${current.pollutants.pm10?.value || 0} µg/m³`, ratio: `${current.pollutants.pm10?.ratioToWho || 1}x WHO Limit` },
    { label: 'NO₂ (Combustion Gas)', val: `${current.pollutants.no2?.value || 0} µg/m³`, ratio: `${current.pollutants.no2?.ratioToWho || 1}x WHO Limit` },
    { label: 'O₃ (Ground-Level Ozone)', val: `${current.pollutants.o3?.value || 0} µg/m³`, ratio: `${current.pollutants.o3?.ratioToWho || 1}x WHO Limit` }
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
  ctx.fillText('BreatheAI • Real-Time DPCC / CPCB & Copernicus CAMS Telemetry • Breathe Smarter. Live Better.', 64, 565);

  return canvas.toDataURL('image/png');
}

export function generateShareText(location: LocationData, current: CurrentAirQuality): string {
  return `🌿 BreatheAI Air Quality Report for ${location.name}:\n` +
    `• Real-Time AQI: ${current.aqi} (${current.category})\n` +
    `• Dominant Pollutant: ${current.dominantPollutant} (${current.pollutants.pm2_5?.value} µg/m³, ${current.pollutants.pm2_5?.ratioToWho}x WHO Limit)\n` +
    `• Health Advice: ${current.categoryInfo.description}\n\n` +
    `Track authentic live air quality & forecasts on BreatheAI: Breathe Smarter. Live Better. 🌬️`;
}
