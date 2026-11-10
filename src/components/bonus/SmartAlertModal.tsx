import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Volume2, 
  Mail, 
  Send, 
  Loader2, 
  AlertCircle, 
  ShieldAlert 
} from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useAirQuality } from '../../context/AirQualityContext';

interface SmartAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartAlertModal: React.FC<SmartAlertModalProps> = ({ isOpen, onClose }) => {
  const { 
    alerts, 
    addOrUpdateAlert, 
    requestNotificationPermission, 
    triggerTestAlert, 
    sendTestEmailAlert, 
    userEmail, 
    notifyEmail, 
    permissionStatus 
  } = useAlerts();

  const { selectedLocation, currentData } = useAirQuality();

  const [threshold, setThreshold] = useState<number>(alerts[0]?.thresholdAqi || 150);
  const [notifyPm25, setNotifyPm25] = useState<boolean>(true);
  const [email, setEmail] = useState<string>(userEmail || alerts[0]?.userEmail || '');
  const [emailEnabled, setEmailEnabled] = useState<boolean>(notifyEmail || alerts[0]?.notifyEmail || true);
  
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    await addOrUpdateAlert(threshold, notifyPm25, email.trim(), emailEnabled);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleEnablePermissions = async () => {
    await requestNotificationPermission();
  };

  const handleTriggerTestTone = () => {
    triggerTestAlert(currentData?.aqi || 185, selectedLocation.name);
  };

  const handleSendTestEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      setTestEmailFeedback({ success: false, msg: 'Please provide a valid email address first.' });
      return;
    }

    setIsSendingTestEmail(true);
    setTestEmailFeedback(null);

    const res = await sendTestEmailAlert(
      email.trim(), 
      currentData?.aqi || 185, 
      selectedLocation.name
    );

    setIsSendingTestEmail(false);
    if (res.success) {
      setTestEmailFeedback({ success: true, msg: `Verification alert email delivered to ${email.trim()}!` });
    } else {
      setTestEmailFeedback({ success: false, msg: res.error || 'Failed to send alert email.' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#173D32]/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white border border-[#E3E6DC] rounded-3xl shadow-card p-5 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EEF1E8] text-[#173D32] border border-[#E3E6DC]">
              <Bell className="w-5 h-5 text-[#8B5E3C]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-[#173D32]">Smart AQI Alerts & Email Warning</h3>
              <p className="text-[11px] text-[#58645C]">Automated notifications when air quality reaches unhealthy levels</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-[#89938A] hover:text-[#26332D] rounded-xl hover:bg-[#EEF1E8] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Browser Push Permission Card */}
        <div className="mb-4 p-3.5 rounded-2xl bg-[#EEF1E8]/50 border border-[#E3E6DC] flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold font-heading text-[#26332D]">System & Desktop Push Alerts</p>
            <p className="text-[11px] text-[#58645C] mt-0.5">
              Status: <span className="font-mono text-[#173D32] capitalize font-semibold">{permissionStatus}</span>
            </p>
          </div>
          {permissionStatus !== 'granted' && (
            <button
              onClick={handleEnablePermissions}
              className="px-3 py-1.5 text-xs font-semibold font-heading rounded-xl bg-[#173D32] text-[#F7F5ED] hover:bg-[#245543] transition-colors"
            >
              Enable
            </button>
          )}
        </div>

        {/* Threshold Slider */}
        <div className="mb-5 p-4 rounded-2xl bg-[#F7F5ED]/70 border border-[#E3E6DC]">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-[#58645C] font-semibold font-heading">
              Trigger Alert When AQI Crosses:
            </label>
            <span className="font-mono font-bold text-[#173D32] text-sm bg-white px-2.5 py-1 rounded-lg border border-[#E3E6DC]">
              {threshold} AQI
            </span>
          </div>

          <input
            type="range"
            min="50"
            max="350"
            step="25"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-[#173D32] h-2 bg-[#EEF1E8] rounded-lg cursor-pointer my-2"
          />

          <div className="flex justify-between text-[10px] text-[#89938A] mt-1 font-mono">
            <span>50 (Moderate)</span>
            <span className="font-bold text-[#C53030]">150 (Unhealthy)</span>
            <span>300+ (Hazardous)</span>
          </div>
        </div>

        {/* Email Notification Section (SMTP Dispatch) */}
        <div className="mb-5 p-4 rounded-2xl bg-white border border-[#E3E6DC] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8B5E3C]" />
              <span className="text-xs font-bold font-heading text-[#173D32]">
                Automated Email Alerts (SMTP)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#EEF1E8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E3E6DC] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#173D32]"></div>
            </label>
          </div>

          <p className="text-[11px] text-[#58645C] leading-relaxed">
            When ambient air in <strong>{selectedLocation.name}</strong> enters unhealthy ranges ({threshold}+ AQI), an authentic clinical health warning report is emailed directly to your inbox.
          </p>

          <div className="space-y-2">
            <label className="text-[11px] text-[#58645C] font-medium block">
              Recipient Email Address:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="flex-1 text-xs px-3 py-2 bg-[#F7F5ED] border border-[#E3E6DC] rounded-xl text-[#26332D] placeholder-[#89938A] focus:outline-none focus:border-[#173D32]"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTestEmail || !email.trim()}
                className="px-3 py-2 rounded-xl bg-[#EEF1E8] hover:bg-[#A8B99A]/30 text-[#173D32] text-xs font-semibold font-heading transition-colors flex items-center gap-1.5 border border-[#E3E6DC] disabled:opacity-40 flex-shrink-0"
              >
                {isSendingTestEmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#173D32]" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-[#65B9C9]" />
                )}
                <span>Send Email</span>
              </button>
            </div>

            {testEmailFeedback && (
              <div
                className={`p-2.5 rounded-xl text-[11px] flex items-center gap-1.5 ${
                  testEmailFeedback.success
                    ? 'bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20'
                    : 'bg-[#C53030]/10 text-[#C53030] border border-[#C53030]/20'
                }`}
              >
                {testEmailFeedback.success ? (
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span>{testEmailFeedback.msg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Checkbox PM2.5 */}
        <div className="mb-5 flex items-center gap-2.5 p-3 rounded-2xl bg-[#EEF1E8]/40 border border-[#E3E6DC]">
          <input
            type="checkbox"
            id="notifyPm25"
            checked={notifyPm25}
            onChange={(e) => setNotifyPm25(e.target.checked)}
            className="w-4 h-4 rounded text-[#173D32] accent-[#173D32] border-[#E3E6DC]"
          />
          <label htmlFor="notifyPm25" className="text-xs text-[#26332D] cursor-pointer">
            Also trigger alert if fine particulate PM2.5 exceeds 3x WHO guideline (&gt; 45 µg/m³)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#E3E6DC]">
          <button
            onClick={handleTriggerTestTone}
            className="px-3.5 py-2.5 rounded-xl bg-[#EEF1E8] hover:bg-[#A8B99A]/30 text-[#173D32] text-xs font-medium font-heading transition-colors flex items-center gap-1.5 border border-[#E3E6DC]"
          >
            <Volume2 className="w-4 h-4 text-[#8B5E3C]" />
            <span>Test Chime</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#173D32] hover:bg-[#245543] text-[#F7F5ED] text-xs font-semibold font-heading transition-colors flex items-center justify-center gap-1.5 shadow-soft"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-[#65B9C9]" />
                <span>Preferences Saved & Active!</span>
              </>
            ) : (
              <span>Save Alert Preferences</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
