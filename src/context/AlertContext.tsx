import React, { createContext, useContext, useState, useEffect } from 'react';
import { databaseService } from '../services/supabaseService';
import { UserAlertSetting } from '../types/database';

interface AlertContextType {
  alerts: UserAlertSetting[];
  addOrUpdateAlert: (threshold: number, notifyPm25: boolean) => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  triggerTestAlert: (aqi: number, cityName: string) => void;
  permissionStatus: NotificationPermission;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<UserAlertSetting[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    databaseService.getAlerts().then(setAlerts);
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
      console.warn('Audio chime error:', e);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Desktop notifications are not supported by your browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
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
    } else {
      // In-app alert fallback
      alert(`🔔 Smart AQI Alert Triggered!\n${cityName} AQI is ${aqi}.\nThreshold crossed! Recommended action: Keep windows closed and run HEPA air filtration.`);
    }
  };

  const addOrUpdateAlert = async (threshold: number, notifyPm25: boolean) => {
    const alertSetting: UserAlertSetting = {
      id: `alert_${Date.now()}`,
      userId: 'guest-user',
      cityName: 'Primary City',
      latitude: 0,
      longitude: 0,
      thresholdAqi: threshold,
      notifyPm25,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    await databaseService.saveAlert(alertSetting);
    setAlerts([alertSetting]);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        addOrUpdateAlert,
        requestNotificationPermission,
        triggerTestAlert,
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
