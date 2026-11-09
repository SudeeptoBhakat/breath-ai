export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  shortLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', shortLabel: 'EN', flag: '🌐' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', shortLabel: 'हिं', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', shortLabel: 'বাং', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', shortLabel: 'த', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', shortLabel: 'తె', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', shortLabel: 'म', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', shortLabel: 'ગુ', flag: '🇮🇳' }
];

export type TranslationDictionary = Record<string, string>;

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  // ─── ENGLISH (Default) ────────────────────────────────────────────────────────
  en: {
    // Navigation
    'nav.overview': 'Overview',
    'nav.patterns': 'Air patterns',
    'nav.comparison': 'Compare & rankings',
    'nav.health': 'Health & escapes',
    'nav.searchPlaceholder': 'Search a city or station...',
    'nav.locate': 'Locate',
    'nav.saveLocation': 'Save location',
    'nav.saved': 'Remove from saved',
    'nav.alerts': 'Smart AQI Alerts',
    'nav.share': 'Export report card',
    'nav.themeDark': 'Switch to dark theme',
    'nav.themeLight': 'Switch to light theme',
    'nav.askAi': 'Ask BreatheAI',
    'nav.popularMetros': 'Popular Monitored Metros',
    'nav.searchResults': 'Search Results',
    'nav.searching': 'Searching global environmental network...',
    'nav.selectLanguage': 'Select Language',

    // Hero AQI Card
    'hero.liveAirQuality': 'Live local air quality',
    'hero.updated': 'Updated from available stations',
    'hero.sourceAware': 'Source-aware monitoring',
    'hero.dominant': 'Dominant Pollutant',
    'hero.dominantDriver': 'Dominant Driver',
    'hero.whoGuideline': 'WHO Safe Limit',
    'hero.whoMultiple': 'times higher than WHO guideline',
    'hero.consultAi': 'Ask BreatheAI Advice',
    'hero.smartAlerts': 'Set Alert',
    'hero.shareCard': 'Share Report',
    'hero.viewForecast': '5-Day Forecast',
    'hero.exploreSurroundings': 'Explore your surroundings',
    'hero.seeAirBeyond': 'See the air beyond your street.',
    'hero.telemetrySource': 'Real-Time DPCC / CPCB & Open-Meteo Ground Telemetry',

    // AQI Status
    'aqi.good': 'Good',
    'aqi.moderate': 'Moderate',
    'aqi.poor': 'Poor',
    'aqi.unhealthy': 'Unhealthy',
    'aqi.veryUnhealthy': 'Very Unhealthy',
    'aqi.severe': 'Severe',
    'aqi.hazardous': 'Hazardous',

    // Weather Card (Google Weather Style)
    'weather.badge': 'Atmospheric Weather',
    'weather.feelsLike': 'Feels like',
    'weather.flushing': 'Pollutant Flushing',
    'weather.activeDispersal': 'Active Dispersal (Safe)',
    'weather.inversionRisk': 'Inversion Risk',
    'weather.windSpeed': 'Wind Speed',
    'weather.humidity': 'Humidity',
    'weather.ventilation': 'Ventilation',
    'weather.smokeTrap': 'Smoke Trap',
    'weather.calmSmokeTraps': 'Calm (Smoke traps)',
    'weather.lightBreeze': 'Light breeze',
    'weather.activeClearing': 'Active clearing',
    'weather.comfortable': 'Comfortable',
    'weather.highMoisture': 'Moisture holds smog',
    'weather.cleanVertical': 'Clean vertical mixing',
    'weather.trappedNear': 'Trapped near surface',
    'weather.showBoundary': 'Show boundary layer physics',
    'weather.hideBoundary': 'Hide technical physics',

    // Pollutants
    'pollutants.title': 'Atmospheric Pollutant Breakdown',
    'pollutants.subtitle': 'Real-time micro-sensor concentrations compared against WHO safety limits',
    'pollutants.safe': 'Within safe threshold',
    'pollutants.exceeds': 'Exceeds WHO limit',
    'pollutants.pm25': 'Fine Particulate Matter (PM2.5)',
    'pollutants.pm10': 'Coarse Particulates (PM10)',
    'pollutants.no2': 'Nitrogen Dioxide (NO₂)',
    'pollutants.o3': 'Ground Ozone (O₃)',
    'pollutants.so2': 'Sulfur Dioxide (SO₂)',
    'pollutants.co': 'Carbon Monoxide (CO)',

    // Health
    'health.title': 'Clinical Health Guidance & Precautions',
    'health.subtitle': 'Physician-backed advisories for exercise, outdoor time, and home air safety',
    'health.exercise': 'Outdoor Exercise',
    'health.masks': 'Mask Recommendations',
    'health.purifiers': 'Indoor Air Purifiers',
    'health.vulnerable': 'Children & Seniors',
    'health.ventilation': 'Home Ventilation',

    // Analytics & Comparison
    'analytics.historical': 'Historical Air Quality Analytics',
    'analytics.forecast': '5-Day Predictive Atmospheric Forecast',
    'comparison.title': 'Air Quality Comparator',
    'comparison.leaderboard': 'Pollution Leaderboard & Safe Havens',
    'cleanAir.title': 'Clean Air Haven Finder',

    // Modals
    'share.title': 'Share Air Quality Card',
    'share.subtitle': 'Generate high-resolution social infographics and share authentic telemetry',
    'share.captionCopied': 'Caption Copied!',
    'share.copyText': 'Copy Text',
    'share.downloadPng': 'Download PNG Card (1200×630)',
    'share.moreOptions': 'More Share Options...',
    'share.directPlatforms': 'Share directly to social platforms',
    'alert.title': 'Smart Air Quality Alerts',
    'alert.enable': 'Enable Notifications',

    // Footer
    'footer.tagline': 'Breathe Smarter. Live Better.',
    'footer.rights': 'All rights reserved. Real-time telemetry provided by DPCC, CPCB & Open-Meteo.',
    'footer.natureTech': 'Nature × Technology Environmental Intelligence'
  },

  // ─── HINDI (हिन्दी) ─────────────────────────────────────────────────────────
  hi: {
    // Navigation
    'nav.overview': 'अवलोकन',
    'nav.patterns': 'वायु के रुझान',
    'nav.comparison': 'तुलना और रैंकिंग',
    'nav.health': 'स्वास्थ्य और बचाव',
    'nav.searchPlaceholder': 'शहर या स्टेशन खोजें...',
    'nav.locate': 'स्थान पहचानें',
    'nav.saveLocation': 'स्थान सहेजें',
    'nav.saved': 'सहेजे गए से हटाएं',
    'nav.alerts': 'स्मार्ट AQI अलर्ट',
    'nav.share': 'रिपोर्ट साझा करें',
    'nav.themeDark': 'डार्क मोड चुनें',
    'nav.themeLight': 'लाइट मोड चुनें',
    'nav.askAi': 'BreatheAI से पूछें',
    'nav.popularMetros': 'प्रमुख निगरानी वाले शहर',
    'nav.searchResults': 'खोज परिणाम',
    'nav.searching': 'पर्यावरण नेटवर्क में खोज जारी है...',
    'nav.selectLanguage': 'भाषा चुनें',

    // Hero AQI Card
    'hero.liveAirQuality': 'लाइव स्थानीय वायु गुणवत्ता',
    'hero.updated': 'उपलब्ध स्टेशनों से अपडेटेड',
    'hero.sourceAware': 'सटीक स्रोत-आधारित निगरानी',
    'hero.dominant': 'प्रमुख प्रदूषक',
    'hero.dominantDriver': 'मुख्य कारक',
    'hero.whoGuideline': 'WHO सुरक्षित सीमा',
    'hero.whoMultiple': 'गुना WHO सीमा से अधिक',
    'hero.consultAi': 'BreatheAI से सलाह लें',
    'hero.smartAlerts': 'अलर्ट सेट करें',
    'hero.shareCard': 'कार्ड शेयर करें',
    'hero.viewForecast': '5-दिवसीय पूर्वानुमान',
    'hero.exploreSurroundings': 'अपने आसपास का माहौल देखें',
    'hero.seeAirBeyond': 'अपनी सड़क से आगे की हवा को समझें।',
    'hero.telemetrySource': 'रीयल-टाइम DPCC / CPCB और Open-Meteo ग्राउंड डेटा',

    // AQI Status
    'aqi.good': 'अच्छा',
    'aqi.moderate': 'मध्यम',
    'aqi.poor': 'खराब',
    'aqi.unhealthy': 'अस्वस्थ',
    'aqi.veryUnhealthy': 'अत्यंत अस्वस्थ',
    'aqi.severe': 'गंभीर',
    'aqi.hazardous': 'खतरनाक',

    // Weather Card
    'weather.badge': 'वायुमंडलीय मौसम',
    'weather.feelsLike': 'महसूस तापमान',
    'weather.flushing': 'प्रदूषण निकासी',
    'weather.activeDispersal': 'सक्रिय फैलाव (सुरक्षित)',
    'weather.inversionRisk': 'इनवर्जन का जोखिम',
    'weather.windSpeed': 'हवा की गति',
    'weather.humidity': 'नमी (आर्द्रता)',
    'weather.ventilation': 'वायु परिसंचरण',
    'weather.smokeTrap': 'धुआं फंसाव',
    'weather.calmSmokeTraps': 'शांत हवा (धुआं फंसा रहता है)',
    'weather.lightBreeze': 'हल्की हवा',
    'weather.activeClearing': 'सक्रिय सफाई',
    'weather.comfortable': 'आरामदायक नमी',
    'weather.highMoisture': 'नमी से स्मॉग जमता है',
    'weather.cleanVertical': 'ऊर्ध्वाधर स्वच्छ प्रवाह',
    'weather.trappedNear': 'जमीन के पास फंसा धुआं',
    'weather.showBoundary': 'बाउंड्री लेयर विज्ञान देखें',
    'weather.hideBoundary': 'तकनीकी विवरण छिपाएं',

    // Pollutants
    'pollutants.title': 'वायुमंडलीय प्रदूषकों का विवरण',
    'pollutants.subtitle': 'WHO सुरक्षा सीमाओं के मुकाबले माइक्रो-सेंसर की रीयल-टाइम स्थिति',
    'pollutants.safe': 'सुरक्षित सीमा के अंदर',
    'pollutants.exceeds': 'WHO सीमा से अधिक',
    'pollutants.pm25': 'बारीक कण (PM2.5)',
    'pollutants.pm10': 'मोटे कण (PM10)',
    'pollutants.no2': 'नाइट्रोजन डाइऑक्साइड (NO₂)',
    'pollutants.o3': 'सतही ओजोन (O₃)',
    'pollutants.so2': 'सल्फर डाइऑक्साइड (SO₂)',
    'pollutants.co': 'कार्बन मोनोऑक्साइड (CO)',

    // Health
    'health.title': 'स्वास्थ्य मार्गदर्शन और सावधानियां',
    'health.subtitle': 'व्यायाम, बाहर निकलने और घर की हवा के लिए डॉक्टरों द्वारा समर्थित सलाह',
    'health.exercise': 'बाहरी व्यायाम',
    'health.masks': 'मास्क की सिफारिश',
    'health.purifiers': 'एयर प्यूरीफायर',
    'health.vulnerable': 'बच्चे और बुजुर्ग',
    'health.ventilation': 'घर का वेंटिलेशन',

    // Analytics & Comparison
    'analytics.historical': 'ऐतिहासिक वायु गुणवत्ता विश्लेषण',
    'analytics.forecast': '5-दिवसीय वायुमंडलीय पूर्वानुमान',
    'comparison.title': 'वायु गुणवत्ता तुलना',
    'comparison.leaderboard': 'प्रदूषण लीडरबोर्ड और स्वच्छ शहर',
    'cleanAir.title': 'स्वच्छ हवा के स्थान खोजें',

    // Modals
    'share.title': 'वायु गुणवत्ता कार्ड शेयर करें',
    'share.subtitle': 'सोशल मीडिया के लिए हाई-रिज़ॉल्यूशन इन्फोग्राफिक बनाएं',
    'share.captionCopied': 'कैप्शन कॉपी हो गया!',
    'share.copyText': 'टेक्स्ट कॉपी करें',
    'share.downloadPng': 'PNG कार्ड डाउनलोड करें (1200×630)',
    'share.moreOptions': 'अन्य शेयर विकल्प...',
    'share.directPlatforms': 'सोशल प्लेटफॉर्म पर सीधे शेयर करें',
    'alert.title': 'स्मार्ट AQI अलर्ट',
    'alert.enable': 'नोटिफिकेशन चालू करें',

    // Footer
    'footer.tagline': 'बेहतर सांस लें। बेहतर जिएं।',
    'footer.rights': 'सर्वाधिकार सुरक्षित। DPCC, CPCB और Open-Meteo द्वारा लाइव डेटा प्रदत्त।',
    'footer.natureTech': 'प्रकृति × प्रौद्योगिकी पर्यावरण इंटेलिजेंस'
  },

  // ─── BENGALI (বাংলা) ────────────────────────────────────────────────────────
  bn: {
    // Navigation
    'nav.overview': 'একনজরে',
    'nav.patterns': 'বাতাসের গতিপ্রকৃতি',
    'nav.comparison': 'তুলনা ও র‍্যাঙ্কিং',
    'nav.health': 'স্বাস্থ্য ও সুরক্ষা',
    'nav.searchPlaceholder': 'শহর বা স্টেশন খুঁজুন...',
    'nav.locate': 'অবস্থান নির্ণয়',
    'nav.saveLocation': 'সংরক্ষণ করুন',
    'nav.saved': 'সংরক্ষণ তালিকা থেকে সরান',
    'nav.alerts': 'স্মার্ট AQI অ্যালার্ট',
    'nav.share': 'রিপোর্ট শেয়ার করুন',
    'nav.themeDark': 'ডার্ক মোড চালু করুন',
    'nav.themeLight': 'লাইট মোড চালু করুন',
    'nav.askAi': 'BreatheAI-কে জিজ্ঞাসা করুন',
    'nav.popularMetros': 'জনপ্রিয় শহরসমূহ',
    'nav.searchResults': 'অনুসন্ধানের ফলাফল',
    'nav.searching': 'পরিবেশ নেটওয়ার্কে অনুসন্ধান চলছে...',
    'nav.selectLanguage': 'ভাষা নির্বাচন করুন',

    // Hero AQI Card
    'hero.liveAirQuality': 'লাইভ বাতাসের মান',
    'hero.updated': 'নিকটস্থ স্টেশন থেকে সংগৃহীত',
    'hero.sourceAware': 'নির্ভুল পর্যবেক্ষণ',
    'hero.dominant': 'প্রধান দূষক',
    'hero.dominantDriver': 'মূল চালক',
    'hero.whoGuideline': 'WHO নিরাপদ সীমা',
    'hero.whoMultiple': 'গুণ WHO সীমার বেশি',
    'hero.consultAi': 'BreatheAI-এর পরামর্শ নিন',
    'hero.smartAlerts': 'অ্যালার্ট সেট করুন',
    'hero.shareCard': 'শেয়ার করুন',
    'hero.viewForecast': '৫ দিনের পূর্বাভাস',
    'hero.exploreSurroundings': 'আপনার চারপাশ দেখুন',
    'hero.seeAirBeyond': 'আপনার এলাকার বাতাসের আসল অবস্থা জানুন।',
    'hero.telemetrySource': 'রিয়েল-টাইম DPCC / CPCB এবং Open-Meteo গ্রাউন্ড ডেটা',

    // AQI Status
    'aqi.good': 'ভালো',
    'aqi.moderate': 'মাঝারি',
    'aqi.poor': 'খারাপ',
    'aqi.unhealthy': 'অস্বাস্থ্যকর',
    'aqi.veryUnhealthy': 'খুব অস্বাস্থ্যকর',
    'aqi.severe': 'মারাত্মক',
    'aqi.hazardous': 'বিপজ্জনক',

    // Weather Card
    'weather.badge': 'বায়ুমণ্ডলীয় আবহাওয়া',
    'weather.feelsLike': 'অনুভূত তাপমাত্রা',
    'weather.flushing': 'বাতাস সঞ্চালন',
    'weather.activeDispersal': 'সক্রিয় বিচ্ছুরণ (নিরাপদ)',
    'weather.inversionRisk': 'ইনভার্সন ঝুঁকি',
    'weather.windSpeed': 'বাতাসের গতি',
    'weather.humidity': 'আর্দ্রতা',
    'weather.ventilation': 'ভেন্টিলেশন',
    'weather.smokeTrap': 'ধোঁয়া আটকা',
    'weather.calmSmokeTraps': 'স্থির বাতাস (ধোঁয়া জমে থাকে)',
    'weather.lightBreeze': 'মৃদু বাতাস',
    'weather.activeClearing': 'সক্রিয় পরিষ্কারকরণ',
    'weather.comfortable': 'স্বস্তিদায়ক আর্দ্রতা',
    'weather.highMoisture': 'আর্দ্রতায় ধোঁয়াশা তৈরি হয়',
    'weather.cleanVertical': 'উচ্চগতির মুক্ত প্রবাহ',
    'weather.trappedNear': 'মাটির কাছাকাছি আটকে থাকা ধোঁয়া',
    'weather.showBoundary': 'বায়ুমণ্ডলীয় তথ্য দেখুন',
    'weather.hideBoundary': 'প্রযুক্তিগত তথ্য লুকান',

    // Pollutants
    'pollutants.title': 'বায়ু দূষকের বিস্তারিত বিবরণ',
    'pollutants.subtitle': 'WHO নিরাপত্তা সীমার সাথে মাইক্রো-সেন্সরের রিয়েল-টাইম তুলনা',
    'pollutants.safe': 'নিরাপদ সীমার মধ্যে',
    'pollutants.exceeds': 'WHO সীমা ছাড়িয়েছে',
    'pollutants.pm25': 'সূক্ষ্ম কণা (PM2.5)',
    'pollutants.pm10': 'স্থূল কণা (PM10)',
    'pollutants.no2': 'নাইট্রোজেন ডাই অক্সাইড (NO₂)',
    'pollutants.o3': 'গ্রাউন্ড ওজোন (O₃)',
    'pollutants.so2': 'সালফার ডাই অক্সাইড (SO₂)',
    'pollutants.co': 'কার্বন মনোক্সাইড (CO)',

    // Health
    'health.title': 'স্বাস্থ্য বিষয়ক পরামর্শ ও সতর্কতা',
    'health.subtitle': 'শরীরচর্চা, বাইরে যাওয়া এবং ঘরের বাতাস রক্ষার চিকিৎসাবিধি',
    'health.exercise': 'বাইরে শরীরচর্চা',
    'health.masks': 'মাস্ক ব্যবহারের নিয়ম',
    'health.purifiers': 'এয়ার পিউরিফায়ার',
    'health.vulnerable': 'শিশু ও বয়স্কদের সুরক্ষা',
    'health.ventilation': 'ঘরের বাতাস সঞ্চালন',

    // Analytics & Comparison
    'analytics.historical': 'পূর্ববর্তী বাতাসের ইতিহাস ও ট্রেন্ড',
    'analytics.forecast': '৫ দিনের পূর্বাভাস',
    'comparison.title': 'বাতাসের মান তুলনা',
    'comparison.leaderboard': 'দূষণ র‍্যাঙ্কিং ও পরিচ্ছন্ন শহর',
    'cleanAir.title': 'পরিচ্ছন্ন বাতাস অঞ্চল খুঁজুন',

    // Modals
    'share.title': 'বাতাসের মান কার্ড শেয়ার করুন',
    'share.subtitle': 'সোশ্যাল মিডিয়ার জন্য হাই-রেজোলিউশন ইনফোগ্রাফিক তৈরি করুন',
    'share.captionCopied': 'ক্যাপশন কপি হয়েছে!',
    'share.copyText': 'টেক্সট কপি করুন',
    'share.downloadPng': 'PNG কার্ড ডাউনলোড করুন (1200×630)',
    'share.moreOptions': 'আরও শেয়ারিং অপশন...',
    'share.directPlatforms': 'সোশ্যাল প্ল্যাটফর্মে সরাসরি শেয়ার করুন',
    'alert.title': 'স্মার্ট বাতাসের সতর্কতা',
    'alert.enable': 'নোটিফিকেশন চালু করুন',

    // Footer
    'footer.tagline': 'সচেতন শ্বাস নিন। সুস্থ থাকুন।',
    'footer.rights': 'সর্বস্বত্ব সংরক্ষিত। DPCC, CPCB এবং Open-Meteo দ্বারা লাইভ তথ্য সংগৃহীত।',
    'footer.natureTech': 'প্রকৃতি × প্রযুক্তি পরিবেশগত বুদ্ধিমত্তা'
  },

  // ─── TAMIL (தமிழ்) ─────────────────────────────────────────────────────────
  ta: {
    // Navigation
    'nav.overview': 'கண்ணோட்டம்',
    'nav.patterns': 'காற்று வடிவங்கள்',
    'nav.comparison': 'ஒப்பீடு & தரவரிசை',
    'nav.health': 'சுகாதாரம் & பாதுகாப்பு',
    'nav.searchPlaceholder': 'நகரம் அல்லது நிலையத்தைத் தேடுக...',
    'nav.locate': 'இருப்பிடத்தைக் கண்டுபிடி',
    'nav.saveLocation': 'சேமிக்க',
    'nav.saved': 'சேமித்ததை அகற்று',
    'nav.alerts': 'ஸ்மார்ட் AQI எச்சரிக்கைகள்',
    'nav.share': 'அறிக்கையைப் பகிர்',
    'nav.themeDark': 'இருண்ட பயன்முறை',
    'nav.themeLight': 'வெளிச்ச பயன்முறை',
    'nav.askAi': 'BreatheAI-யிடம் கேட்கவும்',
    'nav.popularMetros': 'பிரபலமான நகரங்கள்',
    'nav.searchResults': 'தேடல் முடிவுகள்',
    'nav.searching': 'சுற்றுச்சூழல் வலையமைப்பில் தேடுகிறது...',
    'nav.selectLanguage': 'மொழியைத் தேர்ந்தெடுக்கவும்',

    // Hero AQI Card
    'hero.liveAirQuality': 'நேரடி காற்றின் தரம்',
    'hero.updated': 'கிடைக்கும் நிலையங்களில் இருந்து புதுப்பிக்கப்பட்டது',
    'hero.sourceAware': 'நம்பகமான கண்காணிப்பு',
    'hero.dominant': 'முக்கிய மாசுபடுத்தி',
    'hero.dominantDriver': 'முதன்மை இயக்கி',
    'hero.whoGuideline': 'WHO பாதுகாப்பு வரம்பு',
    'hero.whoMultiple': 'மடங்கு WHO வரம்பை விட அதிகம்',
    'hero.consultAi': 'BreatheAI ஆலோசனை பெறுக',
    'hero.smartAlerts': 'எச்சரிக்கை அமைக்கவும்',
    'hero.shareCard': 'கார்டைப் பகிரவும்',
    'hero.viewForecast': '5-நாள் முன்னறிவிப்பு',
    'hero.exploreSurroundings': 'உங்கள் சுற்றுப்புறத்தை ஆராயுங்கள்',
    'hero.seeAirBeyond': 'உங்கள் தெருவுக்கு அப்பால் உள்ள காற்றைப் புரிந்து கொள்ளுங்கள்.',
    'hero.telemetrySource': 'நிகழ்நேர DPCC / CPCB & Open-Meteo தரைப்பகுதி தரவு',

    // AQI Status
    'aqi.good': 'நல்லது',
    'aqi.moderate': 'மிதமானது',
    'aqi.poor': 'மோசமானது',
    'aqi.unhealthy': 'ஆரோக்கியமற்றது',
    'aqi.veryUnhealthy': 'மிகவும் ஆரோக்கியமற்றது',
    'aqi.severe': 'கடுமையானது',
    'aqi.hazardous': 'ஆபத்தானது',

    // Weather Card
    'weather.badge': 'வளிமண்டல வானிலை',
    'weather.feelsLike': 'உணரப்படும் வெப்பநிலை',
    'weather.flushing': 'காற்று சுத்திகரிப்பு',
    'weather.activeDispersal': 'செயலில் உள்ள காற்று பரவல் (பாதுகாப்பானது)',
    'weather.inversionRisk': 'தலைகீழ் அடுக்கு ஆபத்து',
    'weather.windSpeed': 'காற்றின் வேகம்',
    'weather.humidity': 'ஈரப்பதம்',
    'weather.ventilation': 'காற்றோட்டம்',
    'weather.smokeTrap': 'புகை அடைப்பு',
    'weather.calmSmokeTraps': 'அமைதியான காற்று (புகை கீழே தங்கும்)',
    'weather.lightBreeze': 'லேசான காற்று',
    'weather.activeClearing': 'செயலில் உள்ள தூய்மைப்படுத்தல்',
    'weather.comfortable': 'சௌகரியமான ஈரப்பதம்',
    'weather.highMoisture': 'ஈரப்பதம் புகையைத் தக்கவைக்கிறது',
    'weather.cleanVertical': 'செங்குத்து காற்று கலவை',
    'weather.trappedNear': 'தரைப்பகுதியில் தேங்கிய புகை',
    'weather.showBoundary': 'வளிமண்டல அறிவியல் தகவல்களைக் காட்டு',
    'weather.hideBoundary': 'தொழில்நுட்பத் தகவலை மறைக்க',

    // Pollutants
    'pollutants.title': 'வளிமண்டல மாசுபடுத்திகளின் விவரம்',
    'pollutants.subtitle': 'WHO பாதுகாப்பு வரம்புகளுடன் ஒப்பிடப்படும் நேரடி சென்சார் அளவுகள்',
    'pollutants.safe': 'பாதுகாப்பு வரம்பிற்குள்',
    'pollutants.exceeds': 'WHO வரம்பை தாண்டியுள்ளது',
    'pollutants.pm25': 'நுண் துகள்கள் (PM2.5)',
    'pollutants.pm10': 'கரடுமுரடான துகள்கள் (PM10)',
    'pollutants.no2': 'நைட்ரஜன் டை ஆக்சைடு (NO₂)',
    'pollutants.o3': 'தரைப்பகுதி ஓசோன் (O₃)',
    'pollutants.so2': 'சல்பர் டை ஆக்சைடு (SO₂)',
    'pollutants.co': 'கார்பன் மோனாக்சைடு (CO)',

    // Health
    'health.title': 'சுகாதார வழிகாட்டுதல் & முன்னெச்சரிக்கைகள்',
    'health.subtitle': 'உடற்பயிற்சி, வெளிப்புற நேரம் மற்றும் வீட்டு காற்று பாதுகாப்பிற்கான மருத்துவ வழிகாட்டுதல்',
    'health.exercise': 'வெளிப்புற உடற்பயிற்சி',
    'health.masks': 'முகக்கவச பரிந்துரை',
    'health.purifiers': 'காற்று சுத்திகரிப்பான்',
    'health.vulnerable': 'குழந்தைகள் & முதியவர்கள்',
    'health.ventilation': 'வீட்டு காற்றோட்டம்',

    // Analytics & Comparison
    'analytics.historical': 'காற்றின் தர வரலாற்று பகுப்பாய்வு',
    'analytics.forecast': '5-நாள் வளிமண்டல முன்னறிவிப்பு',
    'comparison.title': 'காற்றின் தர ஒப்பீடு',
    'comparison.leaderboard': 'மாசு தரவரிசை & சுத்தமான நகரங்கள்',
    'cleanAir.title': 'சுத்தமான காற்று பகுதிகளைக் கண்டறியவும்',

    // Modals
    'share.title': 'காற்றின் தர கார்டைப் பகிரவும்',
    'share.subtitle': 'சமூக ஊடகங்களுக்கான உயர் தெளிவுத்திறன் கொண்ட விளக்கப்படத்தை உருவாக்கவும்',
    'share.captionCopied': 'தலைப்பு நகலெடுக்கப்பட்டது!',
    'share.copyText': 'உரையை நகலெடுக்கவும்',
    'share.downloadPng': 'PNG கார்டைப் பதிவிறக்கவும் (1200×630)',
    'share.moreOptions': 'கூடுதல் பகிர்வு விருப்பங்கள்...',
    'share.directPlatforms': 'சமூக தளங்களில் நேரடியாகப் பகிரவும்',
    'alert.title': 'ஸ்மார்ட் காற்றின் எச்சரிக்கை',
    'alert.enable': 'அறிவிப்புகளை இயக்கவும்',

    // Footer
    'footer.tagline': 'சுத்தமான காற்றை சுவாசியுங்கள். ஆரோக்கியமாக வாழுங்கள்.',
    'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. DPCC, CPCB & Open-Meteo நேரடித் தரவு.',
    'footer.natureTech': 'இயற்கை × தொழில்நுட்ப சுற்றுச்சூழல் நுண்ணறிவு'
  },

  // ─── TELUGU (తెలుగు) ────────────────────────────────────────────────────────
  te: {
    // Navigation
    'nav.overview': 'అవలోకనం',
    'nav.patterns': 'వాయు పోకడలు',
    'nav.comparison': 'పోలిక & ర్యాంకింగ్స్',
    'nav.health': 'ఆరోగ్యం & జాగ్రత్తలు',
    'nav.searchPlaceholder': 'నగరం లేదా స్టేషన్ శోధించండి...',
    'nav.locate': 'నా స్థానం',
    'nav.saveLocation': 'సేవ్ చేయండి',
    'nav.saved': 'సేవ్ చేసినవి నుండి తొలగించండి',
    'nav.alerts': 'స్మార్ట్ AQI హెచ్చరికలు',
    'nav.share': 'నివేదికను పంచుకోండి',
    'nav.themeDark': 'డార్క్ మోడ్',
    'nav.themeLight': 'లైట్ మోడ్',
    'nav.askAi': 'BreatheAIని అడగండి',
    'nav.popularMetros': 'ప్రసిద్ధ నగరాలు',
    'nav.searchResults': 'శోధన ఫలితాలు',
    'nav.searching': 'నెట్‌వర్క్‌లో శోధిస్తోంది...',
    'nav.selectLanguage': 'భాషను ఎంచుకోండి',

    // Hero AQI Card
    'hero.liveAirQuality': 'లైవ్ గాలి నాణ్యత',
    'hero.updated': 'స్టేషన్ల నుండి తాజా సమాచారం',
    'hero.sourceAware': 'ఖచ్చితమైన పర్యవేక్షణ',
    'hero.dominant': 'ప్రధాన కాలుష్య కారకం',
    'hero.dominantDriver': 'ప్రధాన కారకం',
    'hero.whoGuideline': 'WHO సురక్షిత పరిమితి',
    'hero.whoMultiple': 'రెట్లు WHO పరిమితి కంటే ఎక్కువ',
    'hero.consultAi': 'BreatheAI సలహా పొందండి',
    'hero.smartAlerts': 'హెచ్చరిక సెట్ చేయండి',
    'hero.shareCard': 'కార్డ్ షేర్ చేయండి',
    'hero.viewForecast': '5-రోజుల అంచనా',
    'hero.exploreSurroundings': 'మీ పరిసరాలను పరిశీలించండి',
    'hero.seeAirBeyond': 'మీ ప్రాంతంలో గాలి స్థితిని సరిగ్గా తెలుసుకోండి.',
    'hero.telemetrySource': 'రియల్-టైమ్ DPCC / CPCB & Open-Meteo గ్రౌండ్ డేటా',

    // AQI Status
    'aqi.good': 'మంచిది',
    'aqi.moderate': 'మితమైనది',
    'aqi.poor': 'పేలవమైనది',
    'aqi.unhealthy': 'అనారోగ్యకరమైనది',
    'aqi.veryUnhealthy': 'చాలా అనారోగ్యకరమైనది',
    'aqi.severe': 'తీవ్రమైనది',
    'aqi.hazardous': 'ప్రమాదకరమైనది',

    // Weather Card
    'weather.badge': 'వాతావరణం & గాలి ప్రవాహం',
    'weather.feelsLike': 'అనిపించే ఉష్ణోగ్రత',
    'weather.flushing': 'గాలి ప్రక్షాళన',
    'weather.activeDispersal': 'చురుకైన గాలి ప్రవాహం (సురక్షితం)',
    'weather.inversionRisk': 'ఇన్వర్షన్ ప్రమాదం',
    'weather.windSpeed': 'గాలి వేగం',
    'weather.humidity': 'తేమ శాతం',
    'weather.ventilation': 'వెంటిలేషన్',
    'weather.smokeTrap': 'పొగ నిల్వ',
    'weather.calmSmokeTraps': 'నిశ్చలమైన గాలి (పొగ కిందే ఉండిపోతుంది)',
    'weather.lightBreeze': 'తేలికపాటి గాలి',
    'weather.activeClearing': 'చురుకైన క్లియరింగ్',
    'weather.comfortable': 'అనుకూలమైన తేమ',
    'weather.highMoisture': 'తేమతో పొగమంచు చేరుతుంది',
    'weather.cleanVertical': 'స్వచ్ఛమైన నిలువు గాలి ప్రవాహం',
    'weather.trappedNear': 'నేల వద్ద చిక్కుకున్న పొగ',
    'weather.showBoundary': 'వాతావరణ భౌతిక శాస్త్రం చూడండి',
    'weather.hideBoundary': 'సాంకేతిక వివరాలు దాచండి',

    // Pollutants
    'pollutants.title': 'గాలి కాలుష్య కారకాల సమగ్ర వివరాలు',
    'pollutants.subtitle': 'WHO భద్రతా ప్రమాణాలతో పోల్చిన లైవ్ సెన్సార్ డేటా',
    'pollutants.safe': 'సురక్షిత పరిమితిలో ఉంది',
    'pollutants.exceeds': 'WHO పరిమితిని మించింది',
    'pollutants.pm25': 'సూక్ష్మ కణాలు (PM2.5)',
    'pollutants.pm10': 'స్థూల కణాలు (PM10)',
    'pollutants.no2': 'నైట్రోజన్ డయాక్సైడ్ (NO₂)',
    'pollutants.o3': 'ఓజోన్ (O₃)',
    'pollutants.so2': 'సల్ఫర్ డయాక్సైడ్ (SO₂)',
    'pollutants.co': 'కార్బన్ మోనాక్సైడ్ (CO)',

    // Health
    'health.title': 'ఆరోగ్య సూచనలు & జాగ్రత్తలు',
    'health.subtitle': 'వ్యాయామం, బయటకు వెళ్లడం మరియు ఇంటి గాలి నాణ్యత కోసం వైద్య సలహాలు',
    'health.exercise': 'బయట వ్యాయామం',
    'health.masks': 'మాస్క్ సిఫార్సులు',
    'health.purifiers': 'ఎయిర్ ప్యూరిఫైయర్లు',
    'health.vulnerable': 'పిల్లలు & వృద్ధులు',
    'health.ventilation': 'ఇంటి వెంటిలేషన్',

    // Analytics & Comparison
    'analytics.historical': 'గాలి నాణ్యత చరిత్ర & విశ్లేషణ',
    'analytics.forecast': '5-రోజుల వాతావరణ అంచనా',
    'comparison.title': 'గాలి నాణ్యత పోలిక',
    'comparison.leaderboard': 'కాలుష్య ర్యాంకింగ్స్ & స్వచ్ఛమైన నగరాలు',
    'cleanAir.title': 'స్వచ్ఛమైన గాలి ప్రాంతాలు',

    // Modals
    'share.title': 'గాలి నాణ్యత కార్డ్ షేర్ చేయండి',
    'share.subtitle': 'సోషల్ మీడియా కోసం హై-రిజల్యూషన్ ఇన్ఫోగ్రాఫిక్ రూపొందించండి',
    'share.captionCopied': 'కాపీ చేయబడింది!',
    'share.copyText': 'టెక్స్ట్ కాపీ చేయండి',
    'share.downloadPng': 'PNG కార్డ్ డౌన్‌లోడ్ చేయండి (1200×630)',
    'share.moreOptions': 'మరిన్ని షేర్ ఎంపికలు...',
    'share.directPlatforms': 'సోషల్ మీడియాలో నేరుగా షేర్ చేయండి',
    'alert.title': 'స్మార్ట్ గాలి నాణ్యత హెచ్చరికలు',
    'alert.enable': 'నోటిఫికేషన్‌లను ప్రారంభించండి',

    // Footer
    'footer.tagline': 'స్వచ్ఛమైన శ్వాస తీసుకోండి. ఆనందంగా జీవించండి.',
    'footer.rights': 'సర్వహక్కులు ప్రత్యేకించబడ్డాయి. DPCC, CPCB & Open-Meteo లైవ్ డేటా.',
    'footer.natureTech': 'ప్రకృతి × సాంకేతిక పర్యావరణ మేధస్సు'
  },

  // ─── MARATHI (मराठी) ────────────────────────────────────────────────────────
  mr: {
    // Navigation
    'nav.overview': 'आढावा',
    'nav.patterns': 'हवेचे नमुने',
    'nav.comparison': 'तुलना आणि रँकिंग',
    'nav.health': 'आरोग्य आणि संरक्षण',
    'nav.searchPlaceholder': 'शहर किंवा स्टेशन शोधा...',
    'nav.locate': 'माझे स्थान',
    'nav.saveLocation': 'स्थान जतन करा',
    'nav.saved': 'जतन केलेल्यामधून काढा',
    'nav.alerts': 'स्मार्ट AQI अलर्ट',
    'nav.share': 'अहवाल शेअर करा',
    'nav.themeDark': 'डार्क मोड',
    'nav.themeLight': 'लाइट मोड',
    'nav.askAi': 'BreatheAI ला विचारा',
    'nav.popularMetros': 'प्रमुख शहरे',
    'nav.searchResults': 'शोध परिणाम',
    'nav.searching': 'पर्यावरण नेटवर्कमध्ये शोध सुरू आहे...',
    'nav.selectLanguage': 'भाषा निवडा',

    // Hero AQI Card
    'hero.liveAirQuality': 'थेट स्थानिक हवेची गुणवत्ता',
    'hero.updated': 'उपलब्ध स्थानकांवरून अपडेट केलेले',
    'hero.sourceAware': 'अचूक निरीक्षण',
    'hero.dominant': 'मुख्य प्रदूषक',
    'hero.dominantDriver': 'प्रमुख घटक',
    'hero.whoGuideline': 'WHO सुरक्षित मर्यादा',
    'hero.whoMultiple': 'पट WHO मर्यादेपेक्षा जास्त',
    'hero.consultAi': 'BreatheAI चा सल्ला घ्या',
    'hero.smartAlerts': 'अलर्ट सेट करा',
    'hero.shareCard': 'कार्ड शेअर करा',
    'hero.viewForecast': '५-दिवसीय अंदाज',
    'hero.exploreSurroundings': 'आपल्या परिसराचा आढावा घ्या',
    'hero.seeAirBeyond': 'आपल्या भागातील हवेची खरी स्थिती जाणून घ्या.',
    'hero.telemetrySource': 'रीयल-टाइम DPCC / CPCB आणि Open-Meteo ग्राउंड डेटा',

    // AQI Status
    'aqi.good': 'चांगली',
    'aqi.moderate': 'मध्यम',
    'aqi.poor': 'खराब',
    'aqi.unhealthy': 'अस्वस्थकारक',
    'aqi.veryUnhealthy': 'अत्यंत अस्वस्थकारक',
    'aqi.severe': 'गंभीर',
    'aqi.hazardous': 'धोकादायक',

    // Weather Card
    'weather.badge': 'वातावरणीय हवामान',
    'weather.feelsLike': 'जाणवणारे तापमान',
    'weather.flushing': 'प्रदूषण विसर्जन',
    'weather.activeDispersal': 'सक्रिय हवेचा प्रवाह (सुरक्षित)',
    'weather.inversionRisk': 'इनव्हर्जन धोका',
    'weather.windSpeed': 'वाऱ्याचा वेग',
    'weather.humidity': 'हवेतील ओलावा (आर्द्रता)',
    'weather.ventilation': 'हवेचे अभिसरण',
    'weather.smokeTrap': 'धूर साचणे',
    'weather.calmSmokeTraps': 'शांत हवा (धूर जमिनीजवळ साचतो)',
    'weather.lightBreeze': 'मंद वारा',
    'weather.activeClearing': 'सक्रिय स्वच्छता',
    'weather.comfortable': 'आरामदायी आर्द्रता',
    'weather.highMoisture': 'ओलाव्यामुळे धुरके साचते',
    'weather.cleanVertical': 'स्वच्छ उभ्या हवेचा प्रवाह',
    'weather.trappedNear': 'जमिनीजवळ अडकलेला धूर',
    'weather.showBoundary': 'हवामान विज्ञान पहा',
    'weather.hideBoundary': 'तांत्रिक माहिती लपवा',

    // Pollutants
    'pollutants.title': 'वातावरणातील प्रदूषकांची सविस्तर माहिती',
    'pollutants.subtitle': 'WHO सुरक्षा मानकांशी तुलना केलेला थेट सेन्सर डेटा',
    'pollutants.safe': 'सुरक्षित मर्यादेत',
    'pollutants.exceeds': 'WHO मर्यादेपेक्षा जास्त',
    'pollutants.pm25': 'अतिसूक्ष्म कण (PM2.5)',
    'pollutants.pm10': 'स्थूल कण (PM10)',
    'pollutants.no2': 'नायट्रोजन डायऑक्साइड (NO₂)',
    'pollutants.o3': 'ओझोन (O₃)',
    'pollutants.so2': 'सल्फर डायऑक्साइड (SO₂)',
    'pollutants.co': 'कार्बन मोनॉक्साइड (CO)',

    // Health
    'health.title': 'आरोग्य मार्गदर्शन आणि खबरदारी',
    'health.subtitle': 'व्यायाम, घराबाहेर जाणे आणि घरातील हवेच्या सुरक्षेसाठी वैद्यकीय सल्ला',
    'health.exercise': 'घराबाहेरील व्यायाम',
    'health.masks': 'मास्कच्या शिफारसी',
    'health.purifiers': 'एअर प्युरिफायर',
    'health.vulnerable': 'लहान मुले आणि वृद्ध',
    'health.ventilation': 'घरातील वायुवीजन',

    // Analytics & Comparison
    'analytics.historical': 'हवेच्या गुणवत्तेचे ऐतिहासिक विश्लेषण',
    'analytics.forecast': '५-दिवसीय हवामान अंदाज',
    'comparison.title': 'हवेच्या गुणवत्तेची तुलना',
    'comparison.leaderboard': 'प्रदूषण रँकिंग आणि स्वच्छ शहरे',
    'cleanAir.title': 'स्वच्छ हवेची ठिकाणे शोधा',

    // Modals
    'share.title': 'हवेच्या गुणवत्तेचे कार्ड शेअर करा',
    'share.subtitle': 'सोशल मीडियासाठी उच्च दर्जाचे इन्फोग्राफिक तयार करा',
    'share.captionCopied': 'कॅपशन कॉपी केले!',
    'share.copyText': 'मजकूर कॉपी करा',
    'share.downloadPng': 'PNG कार्ड डाउनलोड करा (1200×630)',
    'share.moreOptions': 'अधिक शेअर पर्याय...',
    'share.directPlatforms': 'सोशल प्लॅटफॉर्मवर थेट शेअर करा',
    'alert.title': 'स्मार्ट हवेचे अलर्ट',
    'alert.enable': 'सूचना सुरू करा',

    // Footer
    'footer.tagline': 'शुद्ध श्वास घ्या. निरोगी जगा.',
    'footer.rights': 'सर्व हक्क राखीव. DPCC, CPCB आणि Open-Meteo थेट डेटा.',
    'footer.natureTech': 'निसर्ग × तंत्रज्ञान पर्यावरण बुद्धिमत्ता'
  },

  // ─── GUJARATI (ગુજરાતી) ────────────────────────────────────────────────────
  gu: {
    // Navigation
    'nav.overview': 'ઝાંખી',
    'nav.patterns': 'હવાના પ્રવાહો',
    'nav.comparison': 'સરખામણી અને રેન્કિંગ',
    'nav.health': 'આરોગ્ય અને રક્ષણ',
    'nav.searchPlaceholder': 'શહેર અથવા સ્ટેશન શોધો...',
    'nav.locate': 'મારું સ્થાન',
    'nav.saveLocation': 'સાચવો',
    'nav.saved': 'સાચવેલામાંથી દૂર કરો',
    'nav.alerts': 'સ્માર્ટ AQI એલર્ટ્સ',
    'nav.share': 'રિપોર્ટ શેર કરો',
    'nav.themeDark': 'ડાર્ક મોડ',
    'nav.themeLight': 'લાઇટ મોડ',
    'nav.askAi': 'BreatheAI ને પૂછો',
    'nav.popularMetros': 'જાણીતા શહેરો',
    'nav.searchResults': 'શોધ પરિણામો',
    'nav.searching': 'પર્યાવરણ નેટવર્કમાં શોધ ચાલુ છે...',
    'nav.selectLanguage': 'ભાષા પસંદ કરો',

    // Hero AQI Card
    'hero.liveAirQuality': 'લાઇવ હવાની ગુણવત્તા',
    'hero.updated': 'ઉપલબ્ધ સ્ટેશનો પરથી અપડેટ કરેલ',
    'hero.sourceAware': 'સચોટ મોનિટરિંગ',
    'hero.dominant': 'મુખ્ય પ્રદૂષક',
    'hero.dominantDriver': 'મુખ્ય પરિબળ',
    'hero.whoGuideline': 'WHO સલામત મર્યાદા',
    'hero.whoMultiple': 'ગણું WHO મર્યાદા કરતાં વધુ',
    'hero.consultAi': 'BreatheAI ની સલાહ લો',
    'hero.smartAlerts': 'એલર્ટ સેટ કરો',
    'hero.shareCard': 'કાર્ડ શેર કરો',
    'hero.viewForecast': '૫-દિવસની આગાહી',
    'hero.exploreSurroundings': 'તમારી આસપાસનું વાતાવરણ જુઓ',
    'hero.seeAirBeyond': 'તમારા વિસ્તારની હવાની સાચી સ્થિતિ સમજો.',
    'hero.telemetrySource': 'રીઅલ-ટાઇમ DPCC / CPCB અને Open-Meteo ગ્રાઉન્ડ ડેટા',

    // AQI Status
    'aqi.good': 'સારી',
    'aqi.moderate': 'સાધારણ',
    'aqi.poor': 'નબળી',
    'aqi.unhealthy': 'અસ્વસ્થ',
    'aqi.veryUnhealthy': 'ખૂબ જ અસ્વસ્થ',
    'aqi.severe': 'ગંભીર',
    'aqi.hazardous': 'જોખમી',

    // Weather Card
    'weather.badge': 'વાતાવરણીય હવામાન',
    'weather.feelsLike': 'અનુભવાતું તાપમાન',
    'weather.flushing': 'પ્રદૂષણ નિકાલ',
    'weather.activeDispersal': 'સક્રિય હવાનો પ્રવાહ (સલામત)',
    'weather.inversionRisk': 'ઇન્વર્ઝન જોખમ',
    'weather.windSpeed': 'પવનની ગતિ',
    'weather.humidity': 'ભેજનું પ્રમાણ',
    'weather.ventilation': 'વેન્ટિલેશન',
    'weather.smokeTrap': 'ધૂમાડો ભરાવો',
    'weather.calmSmokeTraps': 'શાંત પવન (ધૂમાડો જમીન પાસે જ રહે છે)',
    'weather.lightBreeze': 'ધીમો પવન',
    'weather.activeClearing': 'સક્રિય સફાઈ',
    'weather.comfortable': 'આરામદાયક ભેજ',
    'weather.highMoisture': 'ભેજથી ધુમ્મસ વધે છે',
    'weather.cleanVertical': 'સ્વચ્છ ઊર્ધ્વ પ્રવાહ',
    'weather.trappedNear': 'જમીન પાસે ફસાયેલો ધૂમાડો',
    'weather.showBoundary': 'હવામાન વિજ્ઞાન જુઓ',
    'weather.hideBoundary': 'ટેકનિકલ વિગતો છુપાવો',

    // Pollutants
    'pollutants.title': 'હવાના પ્રદૂષકોની વિગતવાર માહિતી',
    'pollutants.subtitle': 'WHO સુરક્ષા ધોરણો સાથે સરખાવેલ રીઅલ-ટાઇમ સેન્સર ડેટા',
    'pollutants.safe': 'સલામત મર્યાદામાં',
    'pollutants.exceeds': 'WHO મર્યાદાથી વધુ',
    'pollutants.pm25': 'અતિ સૂક્ષ્મ કણો (PM2.5)',
    'pollutants.pm10': 'સ્થૂળ કણો (PM10)',
    'pollutants.no2': 'નાઇટ્રોજન ડાયોક્સાઇડ (NO₂)',
    'pollutants.o3': 'ગ્રાઉન્ડ ઓઝોન (O₃)',
    'pollutants.so2': 'સલ્ફર ડાયોક્સાઇડ (SO₂)',
    'pollutants.co': 'કાર્બન મોનોક્સાઇડ (CO)',

    // Health
    'health.title': 'આરોગ્ય માર્ગદર્શન અને સાવચેતીઓ',
    'health.subtitle': 'કસરત, બહાર નીકળવા અને ઘરની હવા માટે તબીબી માર્ગદર્શિકા',
    'health.exercise': 'બહારની કસરત',
    'health.masks': 'માસ્ક પહેરવાની ભલામણ',
    'health.purifiers': 'એર પ્યુરીફાયર',
    'health.vulnerable': 'બાળકો અને વડીલો',
    'health.ventilation': 'ઘરનું વેન્ટિલેશન',

    // Analytics & Comparison
    'analytics.historical': 'હવાની ગુણવત્તાનું ઐતિહાસિક વિશ્લેષણ',
    'analytics.forecast': '૫-દિવસીય વાતાવરણીય આગાહી',
    'comparison.title': 'હવાની ગુણવત્તાની સરખામણી',
    'comparison.leaderboard': 'પ્રદૂષણ રેન્કિંગ અને સ્વચ્છ શહેરો',
    'cleanAir.title': 'સ્વચ્છ હવાવાળા સ્થળો શોધો',

    // Modals
    'share.title': 'હવાની ગુણવત્તાનું કાર્ડ શેર કરો',
    'share.subtitle': 'સોશિયલ મીડિયા માટે ઉચ્ચ ગુણવત્તાનું ઇન્ફોગ્રાફિક બનાવો',
    'share.captionCopied': 'કેપ્શન કોપી થઈ ગયું!',
    'share.copyText': 'લખાણ કોપી કરો',
    'share.downloadPng': 'PNG કાર્ડ ડાઉનલોડ કરો (1200×630)',
    'share.moreOptions': 'વધુ શેરિંગ વિકલ્પો...',
    'share.directPlatforms': 'સોશિયલ પ્લેટફોર્મ પર સીધું શેર કરો',
    'alert.title': 'સ્માર્ટ હવાનું એલર્ટ',
    'alert.enable': 'નોટિફિકેશન ચાલુ કરો',

    // Footer
    'footer.tagline': 'શુદ્ધ શ્વાસ લો. સ્વસ્થ જીવો.',
    'footer.rights': 'સર્વાધિકાર સુરક્ષિત. DPCC, CPCB અને Open-Meteo દ્વારા લાઇવ ડેટા.',
    'footer.natureTech': 'કુદરત × ટેકનોલોજી પર્યાવરણીય બુદ્ધિમત્તા'
  }
};
