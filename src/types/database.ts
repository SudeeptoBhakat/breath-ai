export interface UserFavoriteLocation {
  id: string;
  userId: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  country: string;
  savedAt: string;
}

export interface UserAlertSetting {
  id: string;
  userId: string;
  cityName: string;
  latitude: number;
  longitude: number;
  thresholdAqi: number;
  notifyPm25: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CommunityAirReport {
  id: string;
  cityName: string;
  latitude: number;
  longitude: number;
  smellSeverity: 'None' | 'Mild Smog' | 'Strong Smoke' | 'Acrid/Burning';
  visibilityMeters: number;
  comments: string;
  reportedAt: string;
}

export interface LeaderboardCity {
  rank: number;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  aqi: number;
  category: string;
  primaryPollutant: string;
  pm25: number;
}
