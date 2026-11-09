import { CurrentAirQuality, LocationData } from '../types/aqi';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

type ReplyLanguage = 'English' | 'Hindi' | 'Bengali' | 'Tamil';

const detectReplyLanguage = (text: string, selectedLanguage: string): ReplyLanguage => {
  if (selectedLanguage !== 'Auto') return selectedLanguage as ReplyLanguage;
  if (/[ঀ-৿]/.test(text)) return 'Bengali';
  if (/[ऀ-ॿ]/.test(text)) return 'Hindi';
  if (/[஀-௿]/.test(text)) return 'Tamil';
  if (/\b(kaise|kaisa|kya|hai|hain|aap|tum|mujhe|mera|bahar|mask|sahi|namaste|dhanyavaad)\b/i.test(text)) return 'Hindi';
  return 'English';
};

const plain = (text: string) => text.replace(/\*\*/g, '').replace(/\\([*_])/g, '$1');

const conversationalFallback = (query: string, location: LocationData, aqi: number, category: string, language: ReplyLanguage) => {
  const q = query.toLowerCase().trim();
  const isGreeting = /^(hi|hello|hey|hii|helo|namaste|namaskar|kaise ho|kaisa hai|কি খবর|হ্যালো|வணக்கம்)/i.test(q);
  const isHowAreYou = /how (are|r) you|kaise ho|kaisa hai|কেমন আছ|எப்படி இருக்க/i.test(q);
  const airNote = aqi > 150 ? `${location.name} ka AQI ${aqi} hai, isliye aaj thoda careful rehna better hoga.` : `${location.name} mein AQI ${aqi} hai—abhi conditions manageable hain.`;

  if (language === 'Hindi') {
    if (isGreeting || isHowAreYou) return `Main theek hoon—poochhne ke liye shukriya! 🌿 ${airNote} Aap apne din, walk, mask, ya ghar ki hawa ke baare mein kuch bhi pooch sakte hain.`;
    if (/run|walk|exercise|jog|bahar|walk|दौड़|व्यायाम/i.test(q)) return aqi > 100 ? `Aaj outdoor workout skip karna behtar hoga. ${location.name} mein AQI ${aqi} (${category}) hai; indoor workout ya short, easy walk choose karein.` : `Aaj halki walk ya workout theek rahega. Bas busy traffic routes avoid karein aur body ke signals sunte rahein.`;
    if (/mask|n95|ffp|मास्क/i.test(q)) return aqi > 100 ? `Haan, bahar nikalte waqt well-fitted N95 ya FFP2 mask use karein. Mask ka nose bridge aur sides snug honi chahiye.` : `Abhi mask optional hai, lekin traffic ya dust ke paas N95 zyada protection de sakta hai.`;
    return `Samajh gaya. ${airNote} Main aapke sawaal mein madad karna chahta hoon—thoda aur context batayein, jaise outdoor plan, mask, ya ghar ki air quality?`;
  }
  if (language === 'Bengali') {
    if (isGreeting || isHowAreYou) return `আমি ভালো আছি—জিজ্ঞেস করার জন্য ধন্যবাদ! 🌿 ${location.name}-এ এখন AQI ${aqi} (${category})। বাইরে যাওয়া, মাস্ক বা ঘরের বাতাস নিয়ে যা জানতে চান বলুন।`;
    if (/run|walk|exercise|jog|বাইরে|হাঁট|ব্যায়াম/i.test(q)) return aqi > 100 ? `আজ বাইরে ব্যায়াম না করাই ভালো। AQI ${aqi}, তাই ঘরের ভিতরে হালকা ব্যায়াম বেছে নিন।` : `আজ হালকা হাঁটা বা ব্যায়াম করা যেতে পারে। ব্যস্ত রাস্তা এড়িয়ে চলুন।`;
    if (/mask|n95|ffp|মাস্ক/i.test(q)) return aqi > 100 ? `বাইরে গেলে ভালোভাবে ফিট করা N95 বা FFP2 মাস্ক ব্যবহার করুন। নাক ও পাশের ফাঁক যেন না থাকে।` : `এখন মাস্ক বাধ্যতামূলক নয়, তবে ধুলো বা ট্রাফিকের কাছে N95 বেশি সুরক্ষা দেয়।`;
    return `আমি সাহায্য করতে প্রস্তুত। ${location.name}-এ AQI এখন ${aqi}। আপনার পরিকল্পনা বা উদ্বেগটি আর একটু বলবেন?`;
  }
  if (language === 'Tamil') {
    if (isGreeting || isHowAreYou) return `நான் நன்றாக இருக்கிறேன்—கேட்டதற்கு நன்றி! 🌿 ${location.name}-இல் AQI ${aqi} (${category}). வெளியே செல்லுதல், முகக்கவசம் அல்லது வீட்டுக் காற்று குறித்து கேளுங்கள்.`;
    return `உங்கள் கேள்விக்கு உதவ விரும்புகிறேன். ${location.name}-இல் AQI தற்போது ${aqi}. உங்கள் வெளிப்புறத் திட்டம் அல்லது உடல்நலக் கவலை பற்றி இன்னும் கொஞ்சம் கூறுங்கள்.`;
  }
  if (isGreeting || isHowAreYou) return `I’m doing well—thanks for asking! 🌿 I’m keeping an eye on ${location.name}: AQI is ${aqi} (${category}) right now. How can I help with your plans today?`;
  return `I’m with you. In ${location.name}, AQI is ${aqi} (${category}) right now. Tell me what you’re deciding—going out, exercise, a mask, or improving indoor air—and I’ll give you a practical answer.`;
};

export async function askBreatheAI(
  userQuery: string,
  location: LocationData,
  current: CurrentAirQuality | null,
  chatHistory: ChatMessage[] = [],
  language = 'Auto'
): Promise<string> {
  const aqi = current?.aqi ?? 180;
  const category = current?.category ?? 'Unhealthy';
  const dominant = current?.dominantPollutant ?? 'PM2.5';
  const pm25 = current?.pollutants?.pm2_5?.value ?? 120;
  const whoRatio = current?.pollutants?.pm2_5?.ratioToWho ?? 8.0;
  const temp = current?.weather?.temperature ?? 26;
  const wind = current?.weather?.windSpeed ?? 5;
  const replyLanguage = detectReplyLanguage(userQuery, language);

  // The key never enters the browser: production requests go to the Pages Function.
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch('/api/breathe-ai', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: userQuery,
        language,
        location: { name: location.name, displayName: location.displayName },
        air: { aqi, category, dominantPollutant: dominant, pm25, temperature: temp, windSpeed: wind },
        history: chatHistory.slice(-8).map(message => ({ sender: message.sender, text: message.text }))
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json() as { reply?: string };
      if (data.reply?.trim()) return plain(data.reply.trim());
    }
  } catch {
    // Local development without the Pages Function uses the helpful offline fallback below.
  }

  // ─── Smart Local Fallback Engine ───────────────────────────────────────────
  const q = userQuery.toLowerCase().trim();
  if (replyLanguage !== 'English') return conversationalFallback(userQuery, location, aqi, category, replyLanguage);

  // Greetings & casual conversation
  const greetingWords = ['hi', 'hello', 'hey', 'hii', 'helo', 'howdy', 'sup', 'namaste', 'namaskar'];
  const isGreeting = greetingWords.some(g => q === g || q.startsWith(g + ' ') || q.startsWith(g + '!') || q.startsWith(g + ','));
  
  if (isGreeting) {
    const aqiStatus = aqi > 150 ? `a heads-up though — air quality in **${location.name}** is **${category}** right now (AQI ${aqi}).` : `air quality in **${location.name}** looks ${aqi <= 50 ? 'good today!' : 'moderate today.'}`;
    return `Hey there! 👋 Good to see you. I'm BreatheAI — I keep an eye on the air so you don't have to. Quick ${aqiStatus}\n\nAnything I can help you with? You can ask me about outdoor safety, what pollutants mean, or planning for a poor-air day.`;
  }

  if (q.includes('how are you') || q.includes('how r u') || q.includes('how do you do')) {
    return `I'm doing great, thanks for asking! 😊 Keeping a close watch on the air in **${location.name}** — AQI is at **${aqi}** right now. How can I help you breathe better today?`;
  }

  if (q.includes('thank') || q.includes('thanks') || q === 'ok' || q === 'okay' || q === 'got it' || q === 'cool') {
    return `You're welcome! 🌿 Stay safe out there. Feel free to ask anything else about air quality, health tips, or planning around today's conditions.`;
  }

  if (q.includes('what can you do') || q.includes('what do you do') || q.includes('help me') || q.includes('what are you')) {
    return `I'm your personal air quality guide! Here's what I can help with:\n\n• Is it safe to exercise outside right now?\n• What mask should I wear?\n• How does PM2.5 affect my health?\n• How can I reduce exposure at home?\n• What does AQI ${aqi} actually mean for daily life?\n\nJust ask away!`;
  }

  // Product guidance
  if (q.includes('product') || q.includes('buy') || q.includes('purchase') || q.includes('recommend') || q.includes('what should i get')) {
    const maskAdvice = aqi > 100 ? 'a well-fitting N95 or FFP2 for essential outdoor trips' : 'a comfortable N95 for traffic-heavy or dusty commutes';
    return `For ${location.name} right now, I’d keep it simple: start with ${maskAdvice}, then choose a True HEPA purifier sized for the room you use most. Check the purifier’s CADR and filter replacement cost before buying—those matter more than app features. If you want, tell me your room size and budget and I’ll help you narrow it down.`;
  }

  // Exercise / outdoor activity
  if (q.includes('jog') || q.includes('run') || q.includes('exercise') || q.includes('walk') || q.includes('outdoor') || q.includes('play') || q.includes('sport') || q.includes('cycle') || q.includes('bike')) {
    if (aqi <= 50) return `Great news! Air quality in **${location.name}** is **Good (AQI ${aqi})** — perfect for a run, walk, or outdoor workout. Enjoy the fresh air!`;
    if (aqi <= 100) return `Air quality is **Moderate (AQI ${aqi})** — most people are fine outdoors. If you're sensitive to pollution or doing intense cardio, maybe keep it short and avoid peak traffic hours (morning rush or evening).`;
    if (aqi <= 150) return `With AQI at **${aqi}**, it's **Unhealthy for Sensitive Groups**. Casual walks are okay for healthy adults, but I'd skip intense outdoor cardio today. Children, elderly, and anyone with asthma should stay indoors.`;
    return `I'd strongly recommend skipping outdoor exercise today. AQI is **${aqi} (${category})** with PM2.5 at **${pm25} µg/m³** — breathing deeply during exercise pulls fine particles into your lungs much faster. Indoor workout with windows closed is the safer call.`;
  }

  // Mask guidance
  if (q.includes('mask') || q.includes('n95') || q.includes('kn95') || q.includes('ffp') || q.includes('cloth mask')) {
    return `For AQI ${aqi} in **${location.name}**, here's the quick guide:\n\n**N95 / KN95 / FFP2** — the only masks that actually filter PM2.5. Wear one whenever you're stepping out.\n**Surgical masks** — block large droplets but only \~30% of fine particulates. Not ideal for heavy smog.\n**Cloth masks** — better than nothing, but they let most fine particles through.\n\nSnug fit matters more than the mask brand — no gaps at the sides!`;
  }

  // Smoke events and festivals
  if (q.includes('diwali') || q.includes('cracker') || q.includes('firework') || q.includes('patakha') || q.includes('patakhe') || q.includes('festival')) {
    return `Smoke events can worsen air quality quickly, especially in **${location.name}** where AQI is already at **${aqi}**. Fine particles from combustion can rise sharply over a few hours.\n\nPractical steps: close windows before the peak, run a HEPA purifier on high, and keep children and people with respiratory conditions indoors while the air is smoky.`;
  }

  // PM2.5 / pollutant explanation
  if (q.includes('pm2.5') || q.includes('pm25') || q.includes('pm10') || q.includes('no2') || q.includes('pollutant') || q.includes('what is aqi')) {
    return `**PM2.5** (like the ${pm25} µg/m³ right now in ${location.name}) refers to particles smaller than 2.5 micrometers — tiny enough to enter your bloodstream through your lungs. Long-term exposure is linked to heart disease and lung damage.\n\n**PM10** is coarser dust and pollen — irritates your eyes and nose but doesn't penetrate as deeply.\n\n**AQI ${aqi}** means pollution is at the **${category}** level — the index converts raw concentrations into a simple 0–500 scale so it's easier to act on.`;
  }

  // Air purifier
  if (q.includes('purifier') || q.includes('hepa') || q.includes('filter') || q.includes('indoor') || q.includes('inside')) {
    return `With AQI at **${aqi}** outdoors, running a **True HEPA air purifier** indoors is a smart move. Set it to auto or high, keep windows closed, and let it run continuously. For a bedroom (~150 sq ft), look for a purifier with CADR > 150 CFM. An activated carbon pre-filter also helps absorb odors and gases like NO2.`;
  }

  // Health effects
  if (q.includes('health') || q.includes('lungs') || q.includes('breathe') || q.includes('dangerous') || q.includes('safe') || q.includes('risk') || q.includes('effect') || q.includes('symptom')) {
    return `At **AQI ${aqi} (${category})** in **${location.name}**, ${aqi > 150 ? 'everyone — not just sensitive groups — may start experiencing health effects. Short-term exposure at these levels can irritate your airways, reduce lung function, and worsen conditions like asthma or heart disease.' : aqi > 100 ? 'sensitive individuals (asthma, heart conditions, elderly, children) should be cautious. Healthy adults are generally fine for short exposures.' : 'air quality is acceptable and health risks are low for most people.'} Staying hydrated and limiting prolonged outdoor exposure are always good habits.`;
  }

  // Forecast / prediction
  if (q.includes('forecast') || q.includes('tomorrow') || q.includes('predict') || q.includes('next') || q.includes('week')) {
    return `I can see forecast data on the **5-Day Forecast** tab in the app — it shows predicted AQI trends using Open-Meteo's atmospheric models. For **${location.name}**, the trend over the next few days can help you plan outdoor activities in advance. Check the Forecast tab for the full picture!`;
  }

  // Location / city questions
  if (q.includes('which city') || q.includes('where am') || q.includes('current location') || q.includes('location')) {
    return `You're currently viewing air quality for **${location.name}** (${location.displayName}). AQI right now is **${aqi}**. You can search any city using the search bar at the top to switch locations!`;
  }

  // Default conversational fallback (not a data dump)
  return conversationalFallback(userQuery, location, aqi, category, replyLanguage);
}
