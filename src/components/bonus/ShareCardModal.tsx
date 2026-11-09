import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  X, 
  Loader2, 
  Mail, 
  ExternalLink,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';
import { generateSocialCardPng, generateShareText } from '../../services/exportService';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Brand SVG Icons for crisp, recognizable social buttons
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.02 2.6c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.17 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.21-.17-.46-.29z"/>
  </svg>
);

const XTwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ isOpen, onClose }) => {
  const { selectedLocation, currentData } = useAirQuality();
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const siteUrl = 'https://breath-ai-six.vercel.app/';

  // Generate card on open
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setIsGenerating(true);
      generateSocialCardPng(selectedLocation, currentData)
        .then(img => {
          if (isMounted) setCardImage(img);
        })
        .catch(err => {
          console.warn('Canvas social card generation error:', err);
        })
        .finally(() => {
          if (isMounted) setIsGenerating(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedLocation, currentData]);

  if (!isOpen) return null;

  const locName = selectedLocation?.name || 'My Location';
  const aqiVal = currentData?.aqi ?? 150;
  const categoryVal = currentData?.category ?? 'Moderate';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Download Card PNG
  const handleDownload = () => {
    if (!cardImage) return;
    const a = document.createElement('a');
    a.href = cardImage;
    a.download = `BreatheAI-${locName.replace(/\s+/g, '-')}-AQI-${aqiVal}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('High-resolution social card downloaded!');
  };

  // 2. Copy Caption / Summary Text
  const handleCopyText = async () => {
    const text = generateShareText(selectedLocation, currentData, siteUrl);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Caption copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Please copy manually');
    }
  };

  // 3. Share to WhatsApp
  const handleWhatsApp = () => {
    const text = generateShareText(selectedLocation, currentData, siteUrl);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 4. Share to X (Twitter)
  const handleXTwitter = () => {
    const shortText = `🌿 Live Air Quality in ${locName}: AQI ${aqiVal} (${categoryVal}).\nTrack real-time DPCC & CPCB telemetry:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortText)}&url=${encodeURIComponent(siteUrl)}&hashtags=BreatheAI,AirQuality,AQI`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 5. Share to Facebook
  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 6. Share via Email
  const handleEmail = () => {
    const subject = `BreatheAI Air Quality Report: ${locName} (AQI ${aqiVal} - ${categoryVal})`;
    const body = generateShareText(selectedLocation, currentData, siteUrl);
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  // 7. Share to Instagram (Mobile Native Share or Download + Copy)
  const handleInstagram = async () => {
    // If mobile native Web Share with file is available:
    if (cardImage && navigator.canShare && typeof File !== 'undefined') {
      try {
        const res = await fetch(cardImage);
        const blob = await res.blob();
        const file = new File([blob], `BreatheAI-${locName}-AQI-${aqiVal}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `BreatheAI Air Quality: ${locName}`,
            text: generateShareText(selectedLocation, currentData, siteUrl),
            files: [file]
          });
          return;
        }
      } catch (e) {
        console.warn('Native Instagram share error:', e);
      }
    }

    // Desktop/Fallback: Download image and copy caption
    handleDownload();
    handleCopyText();
    showToast('Card saved & caption copied! Ready to post on Instagram Stories or Feed.');
  };

  // 8. Native System Share (Web Share API)
  const handleNativeShare = async () => {
    const shareText = generateShareText(selectedLocation, currentData, siteUrl);
    if (navigator.share) {
      try {
        if (cardImage && navigator.canShare && typeof File !== 'undefined') {
          const res = await fetch(cardImage);
          const blob = await res.blob();
          const file = new File([blob], `BreatheAI-${locName}-AQI-${aqiVal}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `BreatheAI — Air Quality in ${locName}`,
              text: shareText,
              url: siteUrl,
              files: [file]
            });
            return;
          }
        }
        await navigator.share({
          title: `BreatheAI — Air Quality in ${locName}`,
          text: shareText,
          url: siteUrl
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyText();
        }
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#173D32]/75 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-white border border-[#E3E6DC] rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto animate-enter">
        
        {/* Floating Toast Notice */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#173D32] text-[#F7F5ED] text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-[#A8B99A]/40 flex items-center gap-2 animate-enter">
            <Check className="w-3.5 h-3.5 text-[#65B9C9]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EEF1E8] text-[#173D32] border border-[#E3E6DC] shadow-inner">
              <Share2 className="w-5 h-5 text-[#65B9C9]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-heading text-[#173D32]">
                  Share Air Quality Card
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EEF1E8] text-[#2D6A4F] font-semibold border border-[#2D6A4F]/20">
                  {locName}
                </span>
              </div>
              <p className="text-[11px] text-[#58645C] mt-0.5">
                Generate high-resolution social infographics and share authentic telemetry
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-[#89938A] hover:text-[#26332D] hover:bg-[#EEF1E8] rounded-xl transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Card Preview Box */}
        <div className="mb-5 rounded-2xl overflow-hidden border border-[#E3E6DC] bg-[#173D32] shadow-inner flex items-center justify-center min-h-[200px] sm:min-h-[230px] p-2 relative">
          {isGenerating ? (
            <div className="text-xs text-[#F7F5ED] flex items-center gap-2.5">
              <Loader2 className="w-5 h-5 animate-spin text-[#65B9C9]" />
              <span className="font-heading">Rendering high-resolution 1200×630 infographic...</span>
            </div>
          ) : cardImage ? (
            <img
              src={cardImage}
              alt="Air Quality Social Card Preview"
              className="w-full h-auto object-contain max-h-[260px] rounded-xl shadow-md"
            />
          ) : (
            <div className="text-center p-4 text-[#F7F5ED]/80">
              <p className="text-xs">Preview ready to share</p>
            </div>
          )}
        </div>

        {/* Social Share Options Grid */}
        <div className="space-y-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#58645C] font-heading">
            Share directly to social platforms
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-[#E3E6DC] bg-[#F7F5ED]/60 hover:bg-[#25D366]/10 hover:border-[#25D366]/40 transition-all text-[#26332D] hover:text-[#1E7E34] group"
              title="Share on WhatsApp"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <WhatsAppIcon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">WhatsApp</span>
            </button>

            {/* X (Twitter) */}
            <button
              onClick={handleXTwitter}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-[#E3E6DC] bg-[#F7F5ED]/60 hover:bg-black/5 hover:border-black/30 transition-all text-[#26332D] hover:text-black group"
              title="Share on X"
            >
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <XTwitterIcon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">X (Twitter)</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebook}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-[#E3E6DC] bg-[#F7F5ED]/60 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/40 transition-all text-[#26332D] hover:text-[#1877F2] group"
              title="Share on Facebook"
            >
              <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <FacebookIcon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">Facebook</span>
            </button>

            {/* Instagram */}
            <button
              onClick={handleInstagram}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-[#E3E6DC] bg-[#F7F5ED]/60 hover:bg-rose-50 hover:border-rose-300 transition-all text-[#26332D] hover:text-[#C13584] group"
              title="Share to Instagram"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#405DE6] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <InstagramIcon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">Instagram</span>
            </button>

            {/* Email */}
            <button
              onClick={handleEmail}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-[#E3E6DC] bg-[#F7F5ED]/60 hover:bg-teal-50 hover:border-teal-300 transition-all text-[#26332D] hover:text-teal-700 group"
              title="Share via Email"
            >
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold">Email</span>
            </button>

            {/* Copy Caption */}
            <button
              onClick={handleCopyText}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-[#E3E6DC] bg-[#F7F5ED]/60 hover:bg-[#EEF1E8] hover:border-[#A8B99A] transition-all text-[#26332D] hover:text-[#173D32] group"
              title="Copy Summary Text"
            >
              <div className={`w-8 h-8 rounded-full ${copied ? 'bg-[#2D6A4F]' : 'bg-[#245543]'} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </div>
              <span className="text-[11px] font-semibold">{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-5 pt-4 border-t border-[#E3E6DC] flex flex-col sm:flex-row items-center gap-2.5">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#EEF1E8] hover:bg-[#A8B99A]/30 text-[#173D32] text-xs font-bold font-heading transition-colors flex items-center justify-center gap-2 border border-[#E3E6DC]"
            >
              <Smartphone className="w-4 h-4 text-[#2D6A4F]" />
              <span>More Share Options...</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={!cardImage || isGenerating}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#173D32] hover:bg-[#245543] disabled:opacity-40 text-[#F7F5ED] text-xs font-bold font-heading transition-all flex items-center justify-center gap-2 shadow-card active:scale-[0.99]"
          >
            <Download className="w-4 h-4 text-[#65B9C9]" />
            <span>Download PNG Card (1200×630)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
