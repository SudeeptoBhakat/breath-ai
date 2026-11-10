import { createClient } from '@supabase/supabase-js';
import { UserFavoriteLocation, UserAlertSetting, CommunityAirReport } from '../types/database';
import { logger } from '../utils/logger';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// LocalStorage Fallback Storage Keys
const STORAGE_KEYS = {
  FAVORITES: 'breathe_better_favorites',
  ALERTS: 'breathe_better_alerts',
  REPORTS: 'breathe_better_community_reports'
};

export const databaseService = {
  // --- Favorites Management ---
  async getFavorites(userId: string = 'guest-user'): Promise<UserFavoriteLocation[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', userId);
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            name: d.city_name,
            displayName: d.city_name,
            latitude: d.latitude,
            longitude: d.longitude,
            country: d.country,
            savedAt: d.created_at
          }));
        }
      } catch (err) {
        logger.warn('Supabase fetch failed, falling back to localStorage:', err);
      }
    }

    // LocalStorage fallback
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async addFavorite(item: Omit<UserFavoriteLocation, 'id' | 'savedAt'>): Promise<UserFavoriteLocation> {
    const newItem: UserFavoriteLocation = {
      ...item,
      id: `fav_${Date.now()}`,
      savedAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('user_favorites').insert({
          user_id: item.userId,
          city_name: item.displayName,
          latitude: item.latitude,
          longitude: item.longitude,
          country: item.country
        });
      } catch (err) {
        logger.warn('Supabase insert failed, saving locally:', err);
      }
    }

    const current = await this.getFavorites(item.userId);
    const updated = [newItem, ...current.filter(f => f.name !== item.name)];
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return newItem;
  },

  async removeFavorite(name: string, userId: string = 'guest-user'): Promise<void> {
    if (supabase) {
      try {
        await supabase
          .from('user_favorites')
          .delete()
          .match({ user_id: userId, city_name: name });
      } catch (err) {
        logger.warn('Supabase delete error:', err);
      }
    }

    const current = await this.getFavorites(userId);
    const updated = current.filter(f => f.name !== name);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  },

  // --- Alerts Management ---
  async getAlerts(userId: string = 'guest-user'): Promise<UserAlertSetting[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_alerts')
          .select('*')
          .eq('user_id', userId);
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            cityName: d.city_name,
            latitude: 0,
            longitude: 0,
            thresholdAqi: d.threshold_aqi,
            notifyPm25: d.notify_pm25,
            isActive: d.is_active,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        logger.warn('Supabase alerts fetch error:', err);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!raw) {
      // Default initial alert
      return [
        {
          id: 'default-alert-1',
          userId: 'guest-user',
          cityName: 'All Tracked Cities',
          latitude: 0,
          longitude: 0,
          thresholdAqi: 150,
          notifyPm25: true,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async saveAlert(alert: UserAlertSetting): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('user_alerts').upsert({
          user_id: alert.userId,
          city_name: alert.cityName,
          threshold_aqi: alert.thresholdAqi,
          notify_pm25: alert.notifyPm25,
          is_active: alert.isActive
        });
      } catch (err) {
        logger.warn('Supabase saveAlert error:', err);
      }
    }

    const current = await this.getAlerts(alert.userId);
    const updated = [alert, ...current.filter(a => a.id !== alert.id)];
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
  },

  // --- Community Reports ---
  async addCommunityReport(report: Omit<CommunityAirReport, 'id' | 'reportedAt'>): Promise<CommunityAirReport> {
    const newReport: CommunityAirReport = {
      ...report,
      id: `rep_${Date.now()}`,
      reportedAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('community_reports').insert({
          city_name: report.cityName,
          latitude: report.latitude,
          longitude: report.longitude,
          smell_severity: report.smellSeverity,
          visibility_meters: report.visibilityMeters,
          comments: report.comments
        });
      } catch (err) {
        logger.warn('Supabase community report insert error:', err);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const list: CommunityAirReport[] = raw ? JSON.parse(raw) : [];
    const updated = [newReport, ...list].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    return newReport;
  },

  async getCommunityReports(): Promise<CommunityAirReport[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('community_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            cityName: d.city_name,
            latitude: d.latitude,
            longitude: d.longitude,
            smellSeverity: d.smell_severity,
            visibilityMeters: d.visibility_meters,
            comments: d.comments,
            reportedAt: d.created_at
          }));
        }
      } catch (err) {
        logger.warn('Supabase reports fetch error:', err);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
};

