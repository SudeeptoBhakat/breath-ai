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
  notifyEmail?: boolean;
  userEmail?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  aqi?: number;
  locationName?: string;
  isRead: boolean;
  emailSent?: boolean;
  recipientEmail?: string;
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
