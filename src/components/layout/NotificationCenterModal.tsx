import React from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Mail, 
  ExternalLink,
  Flame
} from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { AppNotification } from '../../types/database';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings
}) => {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications
  } = useAlerts();

  if (!isOpen) return null;

  const formatRelativeTime = (isoString: string): string => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const renderIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'danger':
        return <Flame className="w-4 h-4 text-[#C53030]" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#D69E2E]" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />;
      default:
        return <Info className="w-4 h-4 text-[#65B9C9]" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#173D32]/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white border border-[#E3E6DC] rounded-3xl shadow-card p-5 sm:p-6 flex flex-col max-h-[88vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E3E6DC] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EEF1E8] text-[#173D32] border border-[#E3E6DC] relative">
              <Bell className="w-5 h-5 text-[#8B5E3C]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C53030] text-white text-[9px] font-bold font-mono flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-heading text-[#173D32]">Notification Center</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#C53030]/10 text-[#C53030] font-mono">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#58645C] mt-0.5">Real-time alerts, email dispatches, and environmental warnings</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 text-[#89938A] hover:text-[#26332D] rounded-xl hover:bg-[#EEF1E8] transition-colors"
            aria-label="Close notification center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between py-2.5 px-1 text-xs border-b border-[#E3E6DC] flex-shrink-0">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-semibold text-[#173D32] hover:text-[#245543] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[11px] text-[#89938A] hover:text-[#C53030] flex items-center gap-1 transition-colors ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear history</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-[11px] font-semibold text-[#173D32] bg-[#EEF1E8] hover:bg-[#A8B99A]/30 px-2.5 py-1 rounded-lg border border-[#E3E6DC] flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3 h-3 text-[#8B5E3C]" />
            <span>Alert Settings</span>
          </button>
        </div>

        {/* Scrollable Notification List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-[220px] max-h-[55vh] pr-1">
          {notifications.length === 0 ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF1E8] flex items-center justify-center text-[#A8B99A]">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold font-heading text-[#173D32]">No notifications at this time</p>
              <p className="text-[11px] text-[#58645C] max-w-xs">
                Air quality is continuously monitored. High pollution spikes and automated email warnings will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  notif.isRead
                    ? 'bg-white border-[#E3E6DC] opacity-75 hover:opacity-100'
                    : 'bg-[#EEF1E8]/60 border-[#65B9C9]/40 shadow-soft'
                }`}
              >
                {!notif.isRead && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#173D32]" />
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-[#E3E6DC] flex-shrink-0 mt-0.5 shadow-sm">
                    {renderIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold font-heading text-[#173D32] truncate">
                        {notif.title}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-[#89938A] font-mono">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notif.id);
                          }}
                          title="Remove notification"
                          aria-label="Remove notification"
                          className="p-1 rounded-lg text-[#89938A] hover:text-[#C53030] hover:bg-[#C53030]/10 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#58645C] mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px]">
                      {notif.aqi !== undefined && (
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-[#173D32] text-white">
                          {notif.aqi} AQI
                        </span>
                      )}

                      {notif.locationName && (
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#E3E6DC] text-[#26332D] font-medium font-heading">
                          📍 {notif.locationName}
                        </span>
                      )}

                      {notif.emailSent && (
                        <span className="px-2 py-0.5 rounded-md bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 text-[#2D6A4F] font-medium flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>Email Dispatched</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#E3E6DC] flex items-center justify-between text-[11px] text-[#89938A] flex-shrink-0">
          <span>Automated SMTP & WebPush Engine</span>
          <span className="text-[#173D32] font-medium">BreatheAI Active Monitoring</span>
        </div>

      </div>
    </div>
  );
};
