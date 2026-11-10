import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';
import { databaseService } from '../services/supabaseService';
import { UserAlertSetting, AppNotification } from '../types/database';
import { sendAqiAlertEmail } from '../services/emailService';

interface AlertContextType {
  alerts: UserAlertSetting[];
  userEmail: string;
  setUserEmail: (email: string) => void;
  notifyEmail: boolean;
  setNotifyEmail: (enabled: boolean) => void;
  notifications: AppNotification[];
  unreadCount: number;
  addOrUpdateAlert: (threshold: number, notifyPm25: boolean, email?: string, notifyEmail?: boolean) => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  triggerTestAlert: (aqi: number, cityName: string) => void;
  sendTestEmailAlert: (email: string, aqi: number, cityName: string) => Promise<{ success: boolean; error?: string }>;
  checkAndTriggerAutoAlert: (params: { cityName: string; aqi: number; category: string; dominant?: string; pm25?: number }) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (item: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  permissionStatus: NotificationPermission;
}

const STORAGE_KEYS = {
  EMAIL: 'breathe_user_alert_email',
  NOTIFY_EMAIL: 'breathe_user_notify_email',
  NOTIFICATIONS: 'breathe_notifications_list',
  LAST_ALERT_TS: 'breathe_last_alert_timestamp',
  LAST_EMAIL_TS: 'breathe_last_email_alert_timestamp'
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_welcome',
    title: '🌿 BreatheAI Intelligence Connected',
    message: 'Live ground sensor telemetry initialized for your active monitoring zone. Real-time CPCB and Open-Meteo feeds active.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'info',
    isRead: false
  },
  {
    id: 'notif_winter_advisory',
    title: '⚠️ Winter Smog Trapping Advisory',
    message: 'Surface thermal inversions active in Indo-Gangetic plains during late evenings and early mornings. Avoid outdoor cardio when inversion risk is High.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: 'warning',
    isRead: false
  }
];

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<UserAlertSetting[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  const [userEmail, setUserEmailState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.EMAIL) || '';
    } catch {
      return '';
    }
  });

  const [notifyEmail, setNotifyEmailState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.NOTIFY_EMAIL) === 'true';
    } catch {
      return false;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const setUserEmail = useCallback((email: string) => {
    setUserEmailState(email);
    try {
      localStorage.setItem(STORAGE_KEYS.EMAIL, email);
    } catch {}
  }, []);

  const setNotifyEmail = useCallback((enabled: boolean) => {
    setNotifyEmailState(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFY_EMAIL, String(enabled));
    } catch {}
  }, []);

  useEffect(() => {
    databaseService.getAlerts().then(fetched => {
      setAlerts(fetched);
      if (fetched[0]?.userEmail && !userEmail) {
        setUserEmailState(fetched[0].userEmail);
      }
      if (typeof fetched[0]?.notifyEmail === 'boolean') {
        setNotifyEmailState(fetched[0].notifyEmail);
      }
    });

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      logger.warn('Audio chime error:', e);
    }
  };

  const addNotification = useCallback((item: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  }, []);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addNotification({
        title: 'Notification Support Notice',
        message: 'Desktop notifications are not supported in your current browser environment.',
        type: 'warning'
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        addNotification({
          title: '🔔 Push Notifications Enabled',
          message: 'You will receive immediate high-priority system alerts when air quality crosses critical thresholds.',
          type: 'success'
        });
      }
      return permission === 'granted';
    } catch {
      return false;
    }
  };

  const triggerTestAlert = (aqi: number, cityName: string) => {
    playChime();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`🪔 Smart AQI Alert: ${cityName}`, {
        body: `Air Quality Index has reached ${aqi} (Unhealthy/Hazardous). Sensitive individuals should wear an N95 mask and avoid outdoor cardio.`,
        icon: 'https://cdn-icons-png.flaticon.com/512/3222/3222800.png'
      });
    }

    addNotification({
      title: `🔔 Test Alert Triggered: ${cityName}`,
      message: `AQI reading is ${aqi}. System sound chime and desktop alert sequence tested successfully.`,
      type: aqi > 150 ? 'danger' : 'warning',
      aqi,
      locationName: cityName
    });
  };

  const sendTestEmailAlert = async (
    email: string,
    aqi: number,
    cityName: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const res = await sendAqiAlertEmail({
      toEmail: email,
      cityName,
      aqi,
      category: aqi > 200 ? 'Very Unhealthy' : aqi > 150 ? 'Unhealthy' : 'Moderate',
      categoryColor: aqi > 200 ? '#800080' : aqi > 150 ? '#C53030' : '#D69E2E',
      dominantPollutant: 'PM2.5',
      pm25: aqi > 150 ? 112.4 : 45.2,
      triggerReason: `User triggered verification test for ${email}`
    });

    if (res.success) {
      addNotification({
        title: `📧 Alert Email Sent to ${email}`,
        message: `Verification warning report dispatched via secure SMTP server for ${cityName} (AQI ${aqi}). Check your inbox.`,
        type: 'success',
        aqi,
        locationName: cityName,
        emailSent: true,
        recipientEmail: email
      });
      return { success: true };
    } else {
      addNotification({
        title: `❌ Email Dispatch Failed`,
        message: res.error || 'Failed to dispatch email via SMTP server.',
        type: 'danger'
      });
      return { success: false, error: res.error };
    }
  };

  const checkAndTriggerAutoAlert = useCallback(async (params: {
    cityName: string;
    aqi: number;
    category: string;
    dominant?: string;
    pm25?: number;
  }) => {
    const activeSetting = alerts[0] || { thresholdAqi: 150, notifyPm25: true, notifyEmail: false };
    const threshold = activeSetting.thresholdAqi || 150;

    // Check if threshold is breached
    if (params.aqi < threshold) return;

    const now = Date.now();
    const lastAlert = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_ALERT_TS) || '0', 10);
    const alertCooldown = 30 * 60 * 1000; // 30 minutes cooldown for in-app alert

    if (now - lastAlert > alertCooldown) {
      localStorage.setItem(STORAGE_KEYS.LAST_ALERT_TS, String(now));
      playChime();

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`⚠️ AQI Warning: ${params.cityName}`, {
          body: `Real-time AQI is ${params.aqi} (${params.category}), exceeding your alert threshold of ${threshold}. Wear an N95 mask outdoors.`,
          icon: 'https://cdn-icons-png.flaticon.com/512/3222/3222800.png'
        });
      }

      // Check if email alert should be sent
      const shouldEmail = (notifyEmail || activeSetting.notifyEmail) && (userEmail || activeSetting.userEmail);
      const recipient = userEmail || activeSetting.userEmail || '';
      let emailDispatched = false;

      if (shouldEmail && recipient) {
        const lastEmail = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_EMAIL_TS) || '0', 10);
        const emailCooldown = 2 * 60 * 60 * 1000; // 2 hours cooldown between automated emails

        if (now - lastEmail > emailCooldown) {
          localStorage.setItem(STORAGE_KEYS.LAST_EMAIL_TS, String(now));
          const emailRes = await sendAqiAlertEmail({
            toEmail: recipient,
            cityName: params.cityName,
            aqi: params.aqi,
            category: params.category,
            dominantPollutant: params.dominant || 'PM2.5',
            pm25: params.pm25,
            triggerReason: `Real-time sensor telemetry crossed your set alert threshold (${threshold} AQI)`
          });
          emailDispatched = emailRes.success;
        }
      }

      addNotification({
        title: `⚠️ High AQI Threshold Alert: ${params.cityName}`,
        message: `Air Quality Index is currently ${params.aqi} (${params.category}). Exceeds your threshold (${threshold} AQI). Window sealing and N95 masks advised.${emailDispatched ? ` Alert email dispatched to ${recipient}.` : ''}`,
        type: params.aqi > 200 ? 'danger' : 'warning',
        aqi: params.aqi,
        locationName: params.cityName,
        emailSent: emailDispatched,
        recipientEmail: emailDispatched ? recipient : undefined
      });
    }
  }, [alerts, notifyEmail, userEmail, addNotification]);

  const addOrUpdateAlert = async (
    threshold: number,
    notifyPm25: boolean,
    email?: string,
    notifyEmailFlag?: boolean
  ) => {
    const alertSetting: UserAlertSetting = {
      id: `alert_${Date.now()}`,
      userId: 'guest-user',
      cityName: 'Primary City',
      latitude: 0,
      longitude: 0,
      thresholdAqi: threshold,
      notifyPm25,
      notifyEmail: notifyEmailFlag ?? notifyEmail,
      userEmail: email ?? userEmail,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (email !== undefined) setUserEmail(email);
    if (notifyEmailFlag !== undefined) setNotifyEmail(notifyEmailFlag);

    await databaseService.saveAlert(alertSetting);
    setAlerts([alertSetting]);

    addNotification({
      title: '⚙️ Alert Preferences Updated',
      message: `Alert threshold configured at ${threshold} AQI.${notifyEmailFlag && email ? ` Email dispatch enabled for ${email}.` : ''}`,
      type: 'info'
    });
  };

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AlertContext.Provider
      value={{
        alerts,
        userEmail,
        setUserEmail,
        notifyEmail,
        setNotifyEmail,
        notifications,
        unreadCount,
        addOrUpdateAlert,
        requestNotificationPermission,
        triggerTestAlert,
        sendTestEmailAlert,
        checkAndTriggerAutoAlert,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeNotification,
        clearAllNotifications,
        addNotification,
        permissionStatus
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}
