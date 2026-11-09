import React, { useState } from 'react';
import { Bell, X, Check, Volume2 } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useAirQuality } from '../../context/AirQualityContext';

interface SmartAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartAlertModal: React.FC<SmartAlertModalProps> = ({ isOpen, onClose }) => {
  const { alerts, addOrUpdateAlert, requestNotificationPermission, triggerTestAlert, permissionStatus } = useAlerts();
  const { selectedLocation, currentData } = useAirQuality();

  const [threshold, setThreshold] = useState<number>(alerts[0]?.thresholdAqi || 150);
  const [notifyPm25, setNotifyPm25] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    await addOrUpdateAlert(threshold, notifyPm25);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleEnablePermissions = async () => {
    await requestNotificationPermission();
  };

  const handleTriggerTest = () => {
    triggerTestAlert(currentData?.aqi || 191, selectedLocation.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173D32]/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-[#E3E6DC] rounded-3xl shadow-card p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EEF1E8] text-[#173D32] border border-[#E3E6DC]">
              <Bell className="w-5 h-5 text-[#8B5E3C]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-[#173D32]">Smart AQI Alerts</h3>
              <p className="text-[11px] text-[#58645C]">Real-time warnings when air quality deteriorates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#89938A] hover:text-[#26332D]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Permission Status */}
        <div className="mb-4 p-3.5 rounded-2xl bg-[#EEF1E8]/50 border border-[#E3E6DC] flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold font-heading text-[#26332D]">Browser Notifications</p>
            <p className="text-[11px] text-[#58645C] mt-0.5">
              Status: <span className="font-mono text-[#173D32] capitalize font-medium">{permissionStatus}</span>
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
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-[#58645C] font-medium">
              Alert when AQI crosses:
            </label>
            <span className="font-mono font-bold text-[#173D32] text-sm font-heading">
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
            className="w-full accent-[#173D32] h-2 bg-[#EEF1E8] rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-[#89938A] mt-1.5 font-mono">
            <span>50 (Moderate)</span>
            <span>150 (Unhealthy)</span>
            <span>300+ (Hazardous)</span>
          </div>
        </div>

        {/* Checkbox PM2.5 */}
        <div className="mb-6 flex items-center gap-2.5 p-3 rounded-2xl bg-[#EEF1E8]/30 border border-[#E3E6DC]">
          <input
            type="checkbox"
            id="notifyPm25"
            checked={notifyPm25}
            onChange={(e) => setNotifyPm25(e.target.checked)}
            className="w-4 h-4 rounded text-[#173D32] accent-[#173D32] border-[#E3E6DC]"
          />
          <label htmlFor="notifyPm25" className="text-xs text-[#26332D] cursor-pointer">
            Also alert if fine PM2.5 exceeds 3x WHO guideline (&gt; 45 µg/m³)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerTest}
            className="px-4 py-2.5 rounded-xl bg-[#EEF1E8] hover:bg-[#A8B99A]/30 text-[#173D32] text-xs font-medium font-heading transition-colors flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4 text-[#8B5E3C]" />
            <span>Test Tone</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#173D32] hover:bg-[#245543] text-[#F7F5ED] text-xs font-semibold font-heading transition-colors flex items-center justify-center gap-1.5 shadow-soft"
          >
            {savedSuccess && <Check className="w-4 h-4 text-[#65B9C9]" />}
            <span>{savedSuccess ? 'Preferences Saved!' : 'Save Alert Threshold'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
