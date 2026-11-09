import React, { useState, useEffect } from 'react';
import { Share2, Download, Copy, Check, X, Loader2 } from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';
import { generateSocialCardPng, generateShareText } from '../../services/exportService';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ isOpen, onClose }) => {
  const { selectedLocation, currentData } = useAirQuality();
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && currentData) {
      setIsGenerating(true);
      generateSocialCardPng(selectedLocation, currentData)
        .then(setCardImage)
        .catch(console.error)
        .finally(() => setIsGenerating(false));
    }
  }, [isOpen, selectedLocation, currentData]);

  if (!isOpen || !currentData) return null;

  const handleDownload = () => {
    if (!cardImage) return;
    const a = document.createElement('a');
    a.href = cardImage;
    a.download = `BreatheAI-${selectedLocation.name}-AQI-${currentData.aqi}.png`;
    a.click();
  };

  const handleCopyText = async () => {
    const text = generateShareText(selectedLocation, currentData);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173D32]/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white border border-[#E3E6DC] rounded-3xl shadow-card p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EEF1E8] text-[#173D32] border border-[#E3E6DC]">
              <Share2 className="w-5 h-5 text-[#65B9C9]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-[#173D32]">Export Air Quality Card</h3>
              <p className="text-[11px] text-[#58645C]">Share authentic environmental telemetry to Twitter, LinkedIn, and WhatsApp</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#89938A] hover:text-[#26332D]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Card Preview */}
        <div className="mb-6 rounded-2xl overflow-hidden border border-[#E3E6DC] bg-[#F7F5ED] shadow-inner flex items-center justify-center min-h-[220px] p-2">
          {isGenerating ? (
            <div className="text-xs text-[#58645C] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#173D32]" />
              <span>Rendering high-resolution infographic...</span>
            </div>
          ) : cardImage ? (
            <img
              src={cardImage}
              alt="Air Quality Social Card"
              className="w-full h-auto object-contain max-h-[300px] rounded-xl"
            />
          ) : (
            <p className="text-xs text-[#89938A]">Unable to generate preview</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2.5 rounded-xl bg-[#EEF1E8] hover:bg-[#A8B99A]/30 text-[#173D32] text-xs font-semibold font-heading transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-[#2D6A4F]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Caption Copied!' : 'Copy Summary Text'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!cardImage}
            className="flex-1 py-2.5 rounded-xl bg-[#173D32] hover:bg-[#245543] disabled:opacity-40 text-[#F7F5ED] text-xs font-semibold font-heading transition-colors flex items-center justify-center gap-2 shadow-soft"
          >
            <Download className="w-4 h-4 text-[#65B9C9]" />
            <span>Download PNG Card</span>
          </button>
        </div>

      </div>
    </div>
  );
};
