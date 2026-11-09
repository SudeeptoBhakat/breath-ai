/**
 * Format ISO date string into readable hour / day display
 */
export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

export function formatDateShort(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  const change = ((current - previous) / previous) * 100;
  return Number(change.toFixed(1));
}

export function getWeatherConditionName(code: number): string {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2 || code === 3) return 'Mainly Clear / Partly Cloudy';
  if (code === 45 || code === 48) return 'Dense Smog / Fog';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Rainfall';
  if (code >= 71 && code <= 77) return 'Snow Fall';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear / Mild Haze';
}
