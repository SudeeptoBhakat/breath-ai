import { HourlyReading } from '../types/aqi';

export interface MLPredictionPoint {
  hourOffset: number;
  time: string;
  predictedAqi: number;
  lowerConfidence: number;
  upperConfidence: number;
  confidencePercent: number;
  trendDirection: 'rising' | 'falling' | 'stable';
  primaryFactor: string;
}

export interface AnomalyRecord {
  time: string;
  measuredAqi: number;
  baselineMean: number;
  zScore: number;
  severity: 'Moderate Spike' | 'Severe Surge' | 'Emergency Inversion';
  explanation: string;
}

/**
 * Predict next 12 hours AQI using Exponential Smoothing with Diurnal Seasonality
 */
export function predictAqiTrajectory(
  history: HourlyReading[],
  windSpeed: number = 8,
  humidity: number = 60
): MLPredictionPoint[] {
  if (history.length < 12) return [];

  // Use the last 48 hours of readings
  const sample = history.slice(-48);
  const values = sample.map(r => r.aqi);
  const lastAqi = values[values.length - 1];

  // Alpha parameter for exponential smoothing
  const alpha = 0.35;
  let smoothed = values[0];
  for (let i = 1; i < values.length; i++) {
    smoothed = alpha * values[i] + (1 - alpha) * smoothed;
  }

  // Calculate diurnal (hourly) pattern: average delta per hour of day
  const hourDeltas: Record<number, number[]> = {};
  for (let i = 1; i < sample.length; i++) {
    const h = new Date(sample[i].time).getHours();
    const delta = sample[i].aqi - sample[i - 1].aqi;
    if (!hourDeltas[h]) hourDeltas[h] = [];
    hourDeltas[h].push(delta);
  }

  const hourSeasonalAvg: Record<number, number> = {};
  for (const [h, arr] of Object.entries(hourDeltas)) {
    hourSeasonalAvg[Number(h)] = arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  const predictions: MLPredictionPoint[] = [];
  let currentPred = lastAqi;
  const now = new Date();

  // Weather weighting factor: low wind increases accumulation rate
  const weatherDampener = windSpeed < 6 ? 1.15 : windSpeed > 15 ? 0.88 : 1.0;

  for (let step = 1; step <= 12; step++) {
    const targetDate = new Date(now.getTime() + step * 3600 * 1000);
    const targetHour = targetDate.getHours();
    const seasonalShift = (hourSeasonalAvg[targetHour] || 0) * weatherDampener;

    currentPred = Math.max(15, Math.min(500, Math.round(currentPred * 0.96 + smoothed * 0.04 + seasonalShift)));

    // Confidence decreases with time horizon
    const confidence = Math.max(60, Math.round(95 - step * 2.8));
    const errorMargin = Math.round(currentPred * (0.05 + step * 0.02));

    const trendDirection = currentPred > lastAqi + 5 ? 'rising' : currentPred < lastAqi - 5 ? 'falling' : 'stable';
    
    let primaryFactor = 'Diurnal atmospheric boundary layer change';
    if (targetHour >= 21 || targetHour <= 5) {
      primaryFactor = 'Nighttime radiative cooling & ground-level trapping';
    } else if (targetHour >= 7 && targetHour <= 10) {
      primaryFactor = 'Morning commuter rush hour emissions peak';
    } else if (targetHour >= 12 && targetHour <= 16) {
      primaryFactor = 'Solar thermal convective mixing and ventilation';
    }

    predictions.push({
      hourOffset: step,
      time: targetDate.toISOString(),
      predictedAqi: currentPred,
      lowerConfidence: Math.max(10, currentPred - errorMargin),
      upperConfidence: Math.min(500, currentPred + errorMargin),
      confidencePercent: confidence,
      trendDirection,
      primaryFactor
    });
  }

  return predictions;
}

/**
 * Anomaly Detection using Rolling Window Z-Score (Statistical Deviation)
 */
export function detectPollutionAnomalies(history: HourlyReading[]): AnomalyRecord[] {
  if (history.length < 15) return [];

  const anomalies: AnomalyRecord[] = [];
  const windowSize = 12; // 12-hour rolling baseline

  for (let i = windowSize; i < history.length; i++) {
    const window = history.slice(i - windowSize, i).map(r => r.aqi);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 4) continue; // Skip stable conditions

    const currentVal = history[i].aqi;
    const zScore = (currentVal - mean) / stdDev;

    // Detect statistically significant spikes (z-score > 2.0)
    if (zScore >= 2.0 && currentVal > 100) {
      let severity: AnomalyRecord['severity'] = 'Moderate Spike';
      if (zScore > 3.0 || currentVal > 250) severity = 'Severe Surge';
      if (currentVal > 350) severity = 'Emergency Inversion';

      anomalies.push({
        time: history[i].time,
        measuredAqi: currentVal,
        baselineMean: Math.round(mean),
        zScore: Number(zScore.toFixed(2)),
        severity,
        explanation: `Pollution surged ${Number(((currentVal - mean) / mean * 100).toFixed(0))}% above the 12-hour baseline (Z-Score: ${zScore.toFixed(2)}σ). Typical of burst emission events or sudden micro-meteorological trapping.`
      });
    }
  }

  return anomalies.slice(-6); // Return the top 6 most recent anomalies
}
