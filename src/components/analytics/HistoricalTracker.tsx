import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { useAirQuality } from '../../context/AirQualityContext';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar, 
  Cpu,
  ShieldCheck 
} from 'lucide-react';
import { detectPollutionAnomalies } from '../../services/mlPredictionService';
import { formatTime, formatDateShort } from '../../utils/formatters';

export const HistoricalTracker: React.FC = () => {
  const { hourlyHistory, dailyTrends, spikes, isLoading } = useAirQuality();
  const [timeRange, setTimeRange] = useState<'24h' | '48h' | '7d'>('48h');
  const [metricView, setMetricView] = useState<'aqi' | 'particulates'>('aqi');

  if (isLoading || hourlyHistory.length === 0) {
    return (
      <div className="bg-white border border-[#E3E6DC] rounded-3xl p-8 animate-pulse text-center shadow-card">
        <div className="h-5 w-48 bg-[#EEF1E8] rounded-full mx-auto mb-4" />
        <div className="h-64 bg-[#EEF1E8] rounded-2xl" />
      </div>
    );
  }

  const filteredHistory = timeRange === '24h'
    ? hourlyHistory.slice(-24)
    : timeRange === '48h'
    ? hourlyHistory.slice(-48)
    : hourlyHistory;

  const anomalies = detectPollutionAnomalies(hourlyHistory);

  return (
    <div className="space-y-6">
      
      {/* Historical Chart Card */}
      <div className="bg-white border border-[#E3E6DC] rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold font-heading text-[#173D32] tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
              <span>Historical Atmospheric Telemetry</span>
            </h2>
            <p className="text-xs text-[#58645C] mt-0.5">
              Continuous sensor trends with automated rate-of-change and diurnal pattern analysis
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe Selector */}
            <div className="flex items-center rounded-xl bg-[#EEF1E8] p-1 border border-[#E3E6DC]">
              {(['24h', '48h', '7d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-semibold font-heading rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-[#173D32] text-[#F7F5ED] shadow-soft'
                      : 'text-[#58645C] hover:text-[#173D32]'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Metric Selector */}
            <div className="flex items-center rounded-xl bg-[#EEF1E8] p-1 border border-[#E3E6DC]">
              <button
                onClick={() => setMetricView('aqi')}
                className={`px-3 py-1 text-xs font-semibold font-heading rounded-lg transition-all ${
                  metricView === 'aqi'
                    ? 'bg-[#173D32] text-[#F7F5ED] shadow-soft'
                    : 'text-[#58645C] hover:text-[#173D32]'
                }`}
              >
                US AQI
              </button>
              <button
                onClick={() => setMetricView('particulates')}
                className={`px-3 py-1 text-xs font-semibold font-heading rounded-lg transition-all ${
                  metricView === 'particulates'
                    ? 'bg-[#173D32] text-[#F7F5ED] shadow-soft'
                    : 'text-[#58645C] hover:text-[#173D32]'
                }`}
              >
                PM2.5 vs PM10
              </button>
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            {metricView === 'aqi' ? (
              <AreaChart data={filteredHistory}>
                <defs>
                  <linearGradient id="chartAqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#173D32" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#173D32" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1E8" />
                <XAxis dataKey="formattedTime" stroke="#89938A" fontSize={11} tickMargin={6} />
                <YAxis stroke="#89938A" fontSize={11} domain={[0, 'dataMax + 20']} tickMargin={6} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#E3E6DC] p-3 rounded-2xl shadow-card text-xs">
                          <p className="font-semibold text-[#173D32]">{formatDateShort(d.time)} {d.formattedTime}</p>
                          <p className="text-base font-bold text-[#173D32] mt-1 font-mono font-heading">AQI {d.aqi}</p>
                          <p className="text-[#58645C] font-mono text-[11px]">PM2.5: {d.pm2_5} µg/m³</p>
                          <p className="text-[#58645C] font-mono text-[11px]">PM10: {d.pm10} µg/m³</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="#173D32"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#chartAqiGrad)"
                  name="US AQI"
                />
              </AreaChart>
            ) : (
              <LineChart data={filteredHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1E8" />
                <XAxis dataKey="formattedTime" stroke="#89938A" fontSize={11} tickMargin={6} />
                <YAxis stroke="#89938A" fontSize={11} unit=" µg/m³" tickMargin={6} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#E3E6DC] p-3 rounded-2xl shadow-card text-xs">
                          <p className="font-semibold text-[#173D32]">{formatDateShort(d.time)} {d.formattedTime}</p>
                          <p className="font-bold text-[#A83232] mt-1 font-mono">PM2.5: {d.pm2_5} µg/m³</p>
                          <p className="font-bold text-[#65B9C9] font-mono">PM10: {d.pm10} µg/m³</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="pm2_5" stroke="#A83232" strokeWidth={2} dot={false} name="PM2.5 Fine Particles" />
                <Line type="monotone" dataKey="pm10" stroke="#65B9C9" strokeWidth={2} dot={false} name="PM10 Coarse Inhalable" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Aggregates & Detected Spikes Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Aggregates (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E3E6DC] rounded-3xl p-6 shadow-card">
          <h3 className="text-sm font-bold font-heading text-[#173D32] mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8B5E3C]" />
            <span>Daily Aggregates & Day-over-Day Trends (%)</span>
          </h3>

          <div className="space-y-2.5">
            {dailyTrends.slice(0, 7).map((day, idx) => {
              const isIncrease = (day.changePercent || 0) > 0;

              return (
                <div
                  key={day.date}
                  className="p-3.5 rounded-2xl bg-[#EEF1E8]/40 hover:bg-[#EEF1E8] border border-[#E3E6DC] flex items-center justify-between gap-4 text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E3E6DC] flex flex-col items-center justify-center font-mono shadow-soft">
                      <span className="text-[9px] text-[#89938A] uppercase font-semibold">{day.dayOfWeek.split(' ')[0]}</span>
                      <span className="text-xs font-bold text-[#173D32]">{day.dayOfWeek.split(' ')[2] || day.date.slice(-2)}</span>
                    </div>
                    <div>
                      <p className="font-semibold font-heading text-[#26332D]">{day.dayOfWeek}</p>
                      <p className="text-[11px] text-[#58645C] font-mono">
                        Avg PM2.5: {day.avgPm25} µg/m³ • Daily Range: {day.minAqi} - {day.maxAqi} AQI
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="text-sm font-bold text-[#173D32] font-mono">{day.avgAqi} AQI</span>
                      <p className="text-[10px] text-[#58645C]">{day.category}</p>
                    </div>

                    {idx > 0 && day.changePercent !== undefined && (
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono border ${
                        isIncrease 
                          ? 'bg-[#A83232]/10 text-[#A83232] border-[#A83232]/20' 
                          : 'bg-[#2D6A4F]/10 text-[#2D6A4F] border-[#2D6A4F]/20'
                      }`}>
                        {isIncrease ? `+${day.changePercent}%` : `${day.changePercent}%`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spikes & Anomalies (1 Col) */}
        <div className="bg-white border border-[#E3E6DC] rounded-3xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading text-[#173D32] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#8B5E3C]" />
                <span>Detected Pollution Spikes</span>
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#EEF1E8] text-[#173D32] border border-[#E3E6DC]">
                {spikes.length} Events
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {spikes.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#EEF1E8]/50 text-center text-xs text-[#58645C] border border-[#E3E6DC]">
                  No localized pollution spikes detected. Atmospheric trajectory followed standard diurnal boundaries.
                </div>
              ) : (
                spikes.slice(0, 5).map((spk, i) => (
                  <div
                    key={`spk-${i}`}
                    className="p-3.5 rounded-2xl bg-[#EEF1E8]/40 border border-[#E3E6DC] text-xs"
                  >
                    <div className="flex items-center justify-between font-medium text-[#26332D]">
                      <span>{spk.formattedTime}</span>
                      <span className="font-mono text-[#A83232] font-semibold">{spk.factorAboveNormal}x Normal</span>
                    </div>
                    <p className="font-semibold text-[#173D32] mt-1 font-mono">
                      {spk.pollutant}: {spk.value} (Limit: {spk.standardLimit})
                    </p>
                    <p className="text-[#58645C] text-[11px] mt-0.5 leading-relaxed">{spk.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {anomalies.length > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#EEF1E8] border border-[#E3E6DC] text-xs text-[#26332D]">
              <div className="flex items-center gap-1.5 text-[#173D32] font-semibold font-heading mb-1">
                <Cpu className="w-3.5 h-3.5 text-[#65B9C9]" />
                <span>Rolling Z-Score Anomaly:</span>
              </div>
              <p className="text-[11px] text-[#58645C] leading-relaxed">
                {anomalies[0].explanation}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
