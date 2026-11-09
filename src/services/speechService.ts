export class SpeechAssistant {
  private static recognition: any = null;
  private static isListening: boolean = false;

  public static isSupported(): { recognition: boolean; synthesis: boolean } {
    const hasRecognition = typeof window !== 'undefined' && 
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    const hasSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
    return { recognition: hasRecognition, synthesis: hasSynthesis };
  }

  public static startListening(
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd: () => void,
    language = 'en-US'
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      onError('Speech Recognition not supported in this browser.');
      return false;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = language;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      onError(e);
      return false;
    }
  }

  public static stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public static speak(text: string, onEnd?: () => void, language = 'en-US') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Clean markdown stars, hashes, and backticks for speech
    const cleanText = text
      .replace(/[*#_`$]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\\mu/g, 'micro')
      .replace(/\\ge/g, 'greater than or equal to');

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  }

  public static stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
