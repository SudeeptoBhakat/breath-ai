import { AQICategory, AQICategoryInfo, PollutantDetail } from '../types/aqi';

export const AQI_CATEGORIES: Record<AQICategory, AQICategoryInfo> = {
  'Good': {
    name: 'Good',
    range: [0, 50],
    color: '#10b981', // green-500
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    description: 'Air quality is satisfactory and poses little or no risk.',
    healthImplications: 'Air pollution poses little or no risk to all population segments.',
    activityRecommendations: {
      outdoorExercise: 'Ideal for all outdoor activities and exercises.',
      ventilation: 'Enjoy fresh air. Keep windows open for natural ventilation.',
      maskRequired: false,
      airPurifier: 'Not needed. Natural air is clean.',
      sensitiveGroups: 'Enjoy normal outdoor activities without restrictions.'
    }
  },
  'Moderate': {
    name: 'Moderate',
    range: [51, 100],
    color: '#f59e0b', // amber-500
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    description: 'Air quality is acceptable; however, very sensitive people may feel mild discomfort.',
    healthImplications: 'Unusually sensitive individuals may experience respiratory symptoms.',
    activityRecommendations: {
      outdoorExercise: 'Safe for most outdoor exercises. Take occasional breaks.',
      ventilation: 'Open windows during midday when pollutant levels typically drop.',
      maskRequired: false,
      airPurifier: 'Recommended only for sensitive individuals.',
      sensitiveGroups: 'Consider reducing prolonged heavy outdoor exertion if coughing or tired.'
    }
  },
  'Unhealthy for Sensitive Groups': {
    name: 'Unhealthy for Sensitive Groups',
    range: [101, 150],
    color: '#f97316', // orange-500
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    description: 'Members of sensitive groups may experience health effects; general public is less likely to be affected.',
    healthImplications: 'Children, elderly, and people with lung/heart disease are at risk.',
    activityRecommendations: {
      outdoorExercise: 'Sensitive individuals should limit prolonged or strenuous outdoor activities.',
      ventilation: 'Keep windows closed during early morning and late evening rush hours.',
      maskRequired: true,
      airPurifier: 'Run HEPA air purifier on low/medium speed in bedrooms.',
      sensitiveGroups: 'Keep inhalers handy. Rest indoors during peak smog hours.'
    }
  },
  'Unhealthy': {
    name: 'Unhealthy',
    range: [151, 200],
    color: '#ef4444', // red-500
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    description: 'Everyone may begin to experience adverse health effects; sensitive groups suffer more seriously.',
    healthImplications: 'Increased aggravation of heart and lung conditions among population.',
    activityRecommendations: {
      outdoorExercise: 'Avoid outdoor cardio, jogging, and strenuous sports.',
      ventilation: 'Close windows tightly to prevent toxic particulate infiltration.',
      maskRequired: true,
      airPurifier: 'Run HEPA air purifiers at high setting in sealed rooms.',
      sensitiveGroups: 'Avoid all physical outdoor activity. Remain in climate-controlled indoor spaces.'
    }
  },
  'Very Unhealthy': {
    name: 'Very Unhealthy',
    range: [201, 300],
    color: '#8b5cf6', // purple-500
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    description: 'Health alert: the risk of health effects is significantly increased for everyone.',
    healthImplications: 'General population significantly affected; impaired lung function and breathing distress.',
    activityRecommendations: {
      outdoorExercise: 'Strictly suspend all outdoor exercises and sports.',
      ventilation: 'Seal doors and windows with damp towels or weather strips if smog is pervasive.',
      maskRequired: true,
      airPurifier: 'Continuous HEPA filtration; inspect filter pre-screens.',
      sensitiveGroups: 'Strictly avoid outdoor exposure. Medical consultation advised if symptoms worsen.'
    }
  },
  'Hazardous': {
    name: 'Hazardous',
    range: [301, 500],
    color: '#881337', // rose-900 / maroon
    bgColor: 'bg-rose-950/40',
    borderColor: 'border-rose-600/50',
    textColor: 'text-rose-400',
    description: 'Emergency health warning: Entire population is likely to be seriously affected.',
    healthImplications: 'Severe respiratory illness, cardiovascular distress, emergency advisory in place.',
    activityRecommendations: {
      outdoorExercise: 'Stay indoors! Absolutely avoid any outdoor movement.',
      ventilation: 'Do NOT open windows or balcony doors. Maintain clean indoor air microclimate.',
      maskRequired: true,
      airPurifier: 'Run high-capacity HEPA purifiers 24/7. Use N95/FFP2 masks if going outside is unavoidable.',
      sensitiveGroups: 'High emergency risk. High-risk individuals should relocate to cleaner zones if feasible.'
    }
  }
};

/**
 * Get AQI category based on US EPA standard (0-500 scale)
 */
export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getAQICategoryInfo(aqi: number): AQICategoryInfo {
  const category = getAQICategory(aqi);
  return AQI_CATEGORIES[category];
}

/**
 * WHO 2021 Air Quality Guideline Limits (24-hour mean):
 * PM2.5: 15 µg/m³
 * PM10: 45 µg/m³
 * NO2: 25 µg/m³
 * SO2: 40 µg/m³
 * CO: 4 mg/m³ (4000 µg/m³)
 * O3: 100 µg/m³ (8-hour)
 */
export const WHO_LIMITS = {
  pm2_5: 15,
  pm10: 45,
  no2: 25,
  so2: 40,
  co: 4000,
  o3: 100,
  dust: 50,
  ammonia: 200,
  uv_index: 3
};

/**
 * Format a raw pollutant concentration into a structured detail object
 */
export function formatPollutant(
  code: 'pm2_5' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3' | 'dust' | 'ammonia' | 'uv_index',
  value: number | undefined
): PollutantDetail {
  const safeValue = value ?? 0;
  const whoLimit = WHO_LIMITS[code] || 25;
  const ratioToWho = Number((safeValue / whoLimit).toFixed(1));

  let category: PollutantDetail['category'] = 'Good';
  if (ratioToWho > 4.0) category = 'Hazardous';
  else if (ratioToWho > 2.0) category = 'Unhealthy';
  else if (ratioToWho > 1.0) category = 'Moderate';

  const metaMap = {
    pm2_5: {
      name: 'Fine Particulate Matter',
      formula: 'PM2.5',
      unit: 'µg/m³',
      description: 'Tiny particles < 2.5 µm that penetrate deep into lungs and enter the bloodstream.',
      healthEffects: 'Causes cardiovascular disease, asthma attacks, bronchitis, and reduced lung capacity.'
    },
    pm10: {
      name: 'Coarse Particulate Matter',
      formula: 'PM10',
      unit: 'µg/m³',
      description: 'Inhalable dust, pollen, and smoke particles < 10 µm.',
      healthEffects: 'Irritates eyes, throat, and nasal passages; aggravates chronic lung conditions.'
    },
    no2: {
      name: 'Nitrogen Dioxide',
      formula: 'NO₂',
      unit: 'µg/m³',
      description: 'Toxic gas emitted from vehicle exhausts, power plants, and combustion.',
      healthEffects: 'Causes airway inflammation, coughing, wheezing, and heightened asthma susceptibility.'
    },
    so2: {
      name: 'Sulphur Dioxide',
      formula: 'SO₂',
      unit: 'µg/m³',
      description: 'Pungent gas from coal combustion, industrial smelters, and heavy fuels.',
      healthEffects: 'Tightens airways, causes breathing difficulties, and contributes to acid smog.'
    },
    co: {
      name: 'Carbon Monoxide',
      formula: 'CO',
      unit: 'µg/m³',
      description: 'Colorless, odorless gas resulting from incomplete fuel burning and stubble burning.',
      healthEffects: 'Binds with blood hemoglobin, reducing oxygen delivery to vital organs and brain.'
    },
    o3: {
      name: 'Ground-Level Ozone',
      formula: 'O₃',
      unit: 'µg/m³',
      description: 'Secondary pollutant formed when sunlight triggers reactions with NOx and VOCs.',
      healthEffects: 'Damages lung lining, triggers chest pain, throat irritation, and worsens bronchitis.'
    },
    dust: {
      name: 'Atmospheric Dust',
      formula: 'Dust',
      unit: 'µg/m³',
      description: 'Wind-blown mineral dust and soil aerosols.',
      healthEffects: 'Reduces visibility and causes conjunctivitis and throat dryness.'
    },
    ammonia: {
      name: 'Ammonia',
      formula: 'NH₃',
      unit: 'µg/m³',
      description: 'Agricultural emissions and livestock waste emissions.',
      healthEffects: 'Irritates mucous membranes and contributes to secondary ammonium aerosol formation.'
    },
    uv_index: {
      name: 'Ultraviolet Index',
      formula: 'UV',
      unit: 'index',
      description: 'Measure of solar ultraviolet radiation.',
      healthEffects: 'Excessive exposure causes sunburn, eye cataracts, and accelerated skin aging.'
    }
  };

  const meta = metaMap[code];

  return {
    code,
    name: meta.name,
    formula: meta.formula,
    value: Number(safeValue.toFixed(1)),
    unit: meta.unit,
    category,
    whoLimit,
    ratioToWho,
    description: meta.description,
    healthEffects: meta.healthEffects
  };
}
