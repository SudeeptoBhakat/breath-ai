import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Bot, 
  User, 
  RotateCcw,
  Loader2,
  Leaf,
  Languages
} from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';
import { askBreatheAI, ChatMessage } from '../../services/aiAssistantService';
import { SpeechAssistant } from '../../services/speechService';

interface BreatheAiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreatheAiChat: React.FC<BreatheAiChatProps> = ({ isOpen, onClose }) => {
  const { selectedLocation, currentData } = useAirQuality();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('Auto');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0 && currentData) {
      const welcome: ChatMessage = {
        id: 'msg-welcome',
        sender: 'assistant',
        text: `Hello! 🌿 I am **BreatheAI**, your clinical environmental health assistant.\n\n` +
          `I am analyzing authentic ground sensor telemetry for **${selectedLocation.name}**:\n` +
          `• Real-Time AQI: **${currentData.aqi}** (${currentData.category})\n` +
          `• Dominant Pollutant: **${currentData.dominantPollutant}** (${currentData.pollutants.pm2_5?.value ?? 0} µg/m³)\n\n` +
          `${currentData.aqi > 150 ? "Particulate levels are currently elevated. Avoid strenuous outdoor cardio." : "Air quality is currently within manageable levels."}\n\n` +
          `How can I help with outdoor plans, protective masks, or your family's air-quality routine today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Is it safe for an outdoor run today?',
          'What is the difference between PM2.5 and PM10?',
          'How can I protect my family on a poor-air day?',
          'Which mask works best against toxic smog?'
        ]
      };
      setMessages([welcome]);
    }
  }, [currentData, selectedLocation, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiReply = await askBreatheAI(textToSend, selectedLocation, currentData, messages, language);
      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error('AI chat error:', e);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      SpeechAssistant.stopListening();
      setIsListening(false);
    } else {
      const started = SpeechAssistant.startListening(
        (transcript) => {
          setInputText(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        },
        (err) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        },
        () => setIsListening(false),
        language === 'Hindi' ? 'hi-IN' : language === 'Bengali' ? 'bn-IN' : language === 'Tamil' ? 'ta-IN' : 'en-US'
      );
      if (started) setIsListening(true);
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      SpeechAssistant.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      SpeechAssistant.speak(text, () => setIsSpeaking(false), language === 'Hindi' ? 'hi-IN' : language === 'Bengali' ? 'bn-IN' : language === 'Tamil' ? 'ta-IN' : 'en-US');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="chat-dialog-shell fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#173D32]/75 backdrop-blur-sm animate-fadeIn overscroll-contain"
    >
      <div className="chat-dialog relative w-full h-[100dvh] sm:h-[620px] max-h-[100dvh] sm:max-h-[88vh] sm:max-w-xl bg-[#F7F5ED] border-0 sm:border sm:border-[#E3E6DC] rounded-none sm:rounded-3xl shadow-card flex flex-col overflow-hidden animate-enter">
        
        {/* Dark Forest Green Header: Nature × AI Technology */}
        <div className="p-3 sm:p-4 bg-[#173D32] text-[#F7F5ED] border-b border-[#245543]">
          {/* Mobile swipe/drag affordance indicator */}
          <div className="sm:hidden w-10 h-1 bg-white/30 rounded-full mx-auto mb-2" />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#245543] border border-[#A8B99A]/40 flex items-center justify-center text-[#65B9C9] flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold font-heading text-white truncate">BreatheAI Assistant</h3>
                  <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#245543] text-[#65B9C9] font-mono border border-[#65B9C9]/30">Live assistant</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#A8B99A] truncate">
                  Context: {selectedLocation.name} (AQI {currentData?.aqi || '–'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="relative">
                <Languages className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#65B9C9] pointer-events-none" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-[#245543] border border-[#65B9C9]/30 rounded-lg pl-5 sm:pl-6 pr-2 py-1 sm:py-1.5 text-[10px] text-white outline-none cursor-pointer"
                  aria-label="Select AI language"
                >
                  <option>Auto</option>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Bengali</option>
                  <option>Tamil</option>
                </select>
              </div>
              <button
                onClick={() => setMessages([])}
                className="p-1.5 sm:p-2 rounded-lg text-[#A8B99A] hover:text-white hover:bg-[#245543] transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-lg text-[#A8B99A] hover:text-white hover:bg-[#245543] transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="chat-thread flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#F7F5ED] overscroll-contain">
          <div className="chat-thread-art" aria-hidden="true" />
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#EEF1E8] text-[#173D32] border border-[#E3E6DC] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2D6A4F]" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 text-xs leading-relaxed break-words ${
                  isUser
                    ? 'bg-[#173D32] text-[#F7F5ED] font-medium shadow-soft'
                    : 'bg-white border border-[#E3E6DC] text-[#26332D] shadow-soft'
                }`}>
                  <div className="relative whitespace-pre-line">{msg.text.replace(/\*\*/g, '').replace(/\\([*_])/g, '$1')}</div>

                  <div className={`mt-2 flex items-center justify-between text-[10px] ${isUser ? 'text-[#A8B99A]' : 'text-[#89938A]'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="hover:text-[#173D32] flex items-center gap-1 ml-2 transition-colors p-1"
                        title="Voice readout"
                        aria-label="Voice readout"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-[#8B5E3C]" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {msg.suggestions && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#E3E6DC] flex flex-wrap gap-1.5">
                      {msg.suggestions.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-[#EEF1E8] hover:bg-[#A8B99A]/30 text-[#173D32] border border-[#E3E6DC] transition-colors text-left font-medium"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#245543] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A8B99A]" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2 items-center text-xs text-[#58645C]">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#EEF1E8] flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-[#173D32]" />
              </div>
              <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#E3E6DC] text-[#58645C] shadow-soft">
                Analyzing sensor telemetry...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Safe Area Inset Support */}
        <div className="p-2.5 sm:p-3.5 bg-white border-t border-[#E3E6DC] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop recording' : 'Voice input'}
              aria-label={isListening ? 'Stop voice recording' : 'Start voice input'}
              className={`p-2 sm:p-2.5 rounded-xl border transition-colors flex-shrink-0 ${
                isListening
                  ? 'bg-[#A83232] text-white border-[#A83232]'
                  : 'bg-[#EEF1E8] text-[#173D32] hover:bg-[#A8B99A]/40 border-[#E3E6DC]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about air quality, masks, plans..."
              className="flex-1 min-w-0 text-xs sm:text-sm px-3 py-2 sm:px-3.5 sm:py-2.5 bg-[#F7F5ED] border border-[#E3E6DC] rounded-xl text-[#26332D] placeholder-[#89938A] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              aria-label="Send message"
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#173D32] hover:bg-[#245543] disabled:opacity-40 text-[#F7F5ED] font-semibold font-heading transition-colors flex items-center gap-1.5 shadow-soft flex-shrink-0"
            >
              <Send className="w-4 h-4 text-[#65B9C9]" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
