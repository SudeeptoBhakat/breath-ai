import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAirQuality } from '../../context/AirQualityContext';
import { searchLocations, reverseGeocode } from '../../services/geocodingService';
import { fetchWaqiStation, getWaqiTileUrl } from '../../services/waqiService';
import { getAQICategory, AQI_CATEGORIES } from '../../utils/aqiCalculator';
import { 
  MapPin, 
  Search, 
  X, 
  Check,
  Globe,
  Layers,
  Info
} from 'lucide-react';
import { LocationData } from '../../types/aqi';

// Clean SVG Station Marker Pin
function createStationIcon(aqi: number, isSelected: boolean = false) {
  const cat = getAQICategory(aqi);
  const color = AQI_CATEGORIES[cat].color;
  const size = isSelected ? 38 : 30;

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-color: ${color};
      color: #ffffff;
      font-weight: 700;
      font-size: ${isSelected ? 12 : 10}px;
      font-family: 'Manrope', -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(23,61,50,0.25);
      border: 2px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.9)'};
      transform: translate(-50%, -50%);
      transition: all 0.2s ease;
    ">
      ${aqi}
    </div>
  `;

  return L.divIcon({
    className: 'custom-aqi-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

function MapClickSampler({ onCoordClick }: { onCoordClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onCoordClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 9, { duration: 1.0 });
  }, [center, map]);
  return null;
}

export const AirQualityMap: React.FC = () => {
  const { selectedLocation, setSelectedLocation, currentData } = useAirQuality();
  
  // WAQI Tile Layer state
  const [selectedLayer, setSelectedLayer] = useState<string>('usepa-aqi');
  const [mapSearch, setMapSearch] = useState('');
  const [mapResults, setMapResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sampledLocation, setSampledLocation] = useState<LocationData | null>(null);
  const [sampledWaqi, setSampledWaqi] = useState<any | null>(null);
  const [isSampling, setIsSampling] = useState(false);

  const waqiLayers = [
    { id: 'usepa-aqi', label: 'Composite AQI' },
    { id: 'usepa-pm25', label: 'PM2.5 (Fine)' },
    { id: 'usepa-10', label: 'PM10 (Coarse)' },
    { id: 'usepa-o3', label: 'Ozone (O₃)' },
    { id: 'usepa-no2', label: 'Nitrogen (NO₂)' },
    { id: 'usepa-so2', label: 'Sulfur (SO₂)' },
    { id: 'usepa-co', label: 'Carbon (CO)' }
  ];

  // Authentic ground monitoring stations
  const stationPins = [
    { name: 'Dr. Karni Singh Range (DPCC)', lat: 28.4997, lon: 77.2671, aqi: 191, station: 'Delhi Pollution Control Committee' },
    { name: 'Anand Vihar, Delhi (CPCB)', lat: 28.6508, lon: 77.3153, aqi: 245, station: 'Central Pollution Control Board' },
    { name: 'R.K. Puram, Delhi (DPCC)', lat: 28.5630, lon: 77.1860, aqi: 210, station: 'DPCC Ambient Station' },
    { name: 'Bandra Kurla, Mumbai (MPCB)', lat: 19.0596, lon: 72.8295, aqi: 135, station: 'Maharashtra Pollution Control Board' },
    { name: 'BTM Layout, Bengaluru (KSPCB)', lat: 12.9177, lon: 77.6238, aqi: 65, station: 'Karnataka SPCB' },
    { name: 'Victoria Memorial, Kolkata (WBPCB)', lat: 22.5448, lon: 88.3426, aqi: 182, station: 'West Bengal PCB' },
    { name: 'Muradpur, Patna (BSPCB)', lat: 25.6207, lon: 85.1633, aqi: 255, station: 'Bihar SPCB' },
    { name: 'US Consulate, Hyderabad', lat: 17.4435, lon: 78.3772, aqi: 78, station: 'US Department of State Air' },
    { name: 'London Westminster (AURN)', lat: 51.4995, lon: -0.1332, aqi: 36, station: 'UK Automatic Urban Network' },
    { name: 'Central Park, New York (DEC)', lat: 40.7851, lon: -73.9683, aqi: 41, station: 'NYS DEC Network' }
  ];

  const handleMapClick = async (lat: number, lon: number) => {
    setIsSampling(true);
    setSampledLocation(null);
    setSampledWaqi(null);

    try {
      const [loc, waqiData] = await Promise.all([
        reverseGeocode(lat, lon),
        fetchWaqiStation(lat, lon)
      ]);
      setSampledLocation(loc);
      setSampledWaqi(waqiData);
    } catch (err) {
      console.warn('Map sample error:', err);
    } finally {
      setIsSampling(false);
    }
  };

  const handleMapSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMapSearch(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      const res = await searchLocations(val);
      setMapResults(res);
      setIsSearching(false);
    } else {
      setMapResults([]);
    }
  };

  const handleSelectMapResult = (loc: LocationData) => {
    setSelectedLocation(loc);
    setMapSearch('');
    setMapResults([]);
  };

  return (
    <div className="space-y-4">
      
      {/* Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold font-heading text-[#173D32] flex items-center gap-2">
            <span>Global Air Quality Map Explorer</span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EEF1E8] text-[#173D32] border border-[#E3E6DC]">
              WAQI Live Raster
            </span>
          </h2>
          <p className="text-xs text-[#58645C] mt-0.5">
            Real-world particulate density from aqicn.org on OpenStreetMap. Click anywhere worldwide to inspect ground sensors.
          </p>
        </div>

        {/* Layer Selector */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
          {waqiLayers.map((layer) => {
            const isActive = selectedLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors font-heading ${
                  isActive
                    ? 'bg-[#173D32] text-[#F7F5ED] font-semibold shadow-soft'
                    : 'bg-white hover:bg-[#EEF1E8] text-[#58645C] border border-[#E3E6DC]'
                }`}
              >
                {layer.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="map-explorer-canvas relative w-full h-[600px] rounded-3xl overflow-hidden border border-[#E3E6DC] bg-[#E8E5DC] shadow-card z-0 transition-shadow duration-300 hover:shadow-card-hover">
        
        {/* Floating Search Bar */}
        <div className="map-search-control absolute top-4 left-4 z-[1200] w-72 sm:w-80">
          <div className="map-search-glass relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#89938A] pointer-events-none" />
            <input
              type="text"
              value={mapSearch}
              onChange={handleMapSearchChange}
              placeholder="Search city to inspect on map..."
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-transparent text-[#26332D] placeholder-[#58645C] border-0 rounded-xl focus:outline-none"
            />
            {mapSearch && (
              <button
                onClick={() => setMapSearch('')}
                className="absolute right-3 text-[#89938A] hover:text-[#26332D]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {mapResults.length > 0 && (
            <div className="map-search-results mt-1.5 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
              {mapResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectMapResult(loc)}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#EEF1E8] text-[#26332D] border-b border-[#E3E6DC]/40 last:border-b-0 flex items-center justify-between"
                >
                  <span className="truncate pr-2 font-medium">{loc.displayName}</span>
                  <span className="text-[10px] text-[#89938A] font-mono">{loc.countryCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Leaflet Map */}
        <MapContainer
          center={[selectedLocation.latitude, selectedLocation.longitude]}
          zoom={9}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Base Map: OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* WAQI Atmospheric Tile Overlay */}
          <TileLayer
            key={selectedLayer}
            attribution='&copy; <a href="https://waqi.info/">World Air Quality Index Project</a>'
            url={getWaqiTileUrl(selectedLayer)}
            opacity={0.80}
          />

          <MapCenterUpdater center={[selectedLocation.latitude, selectedLocation.longitude]} />
          <MapClickSampler onCoordClick={handleMapClick} />

          {/* Active Location Pin */}
          {currentData && (
            <Marker
              position={[selectedLocation.latitude, selectedLocation.longitude]}
              icon={createStationIcon(currentData.aqi, true)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 min-w-[210px]">
                  <p className="font-bold font-heading text-sm text-[#173D32]">{selectedLocation.name}</p>
                  <p className="text-[11px] text-[#58645C]">{selectedLocation.displayName}</p>
                  <div className="mt-2.5 pt-2 border-t border-[#E3E6DC] flex items-baseline justify-between">
                    <span 
                      className="text-2xl font-black font-mono"
                      style={{ color: currentData.categoryInfo.color }}
                    >
                      {currentData.aqi} AQI
                    </span>
                    <span className="text-xs font-semibold" style={{ color: currentData.categoryInfo.color }}>
                      {currentData.category}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-[#58645C] font-mono">
                    PM2.5: {currentData.pollutants.pm2_5?.value} µg/m³
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Fixed Stations Network */}
          {stationPins.map((pin, idx) => {
            const isCurrent = Math.abs(pin.lat - selectedLocation.latitude) < 0.04 &&
                              Math.abs(pin.lon - selectedLocation.longitude) < 0.04;
            if (isCurrent) return null;

            return (
              <Marker
                key={`stn-${idx}`}
                position={[pin.lat, pin.lon]}
                icon={createStationIcon(pin.aqi, false)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 min-w-[220px]">
                    <p className="font-bold font-heading text-sm text-[#173D32]">{pin.name}</p>
                    <p className="text-[10px] text-[#58645C]">{pin.station}</p>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-[#26332D]">
                        {pin.aqi} AQI
                      </span>
                      <span className="text-xs font-medium text-[#58645C]">
                        {getAQICategory(pin.aqi)}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedLocation({
                        id: `pin-${idx}`,
                        name: pin.name.split(' (')[0],
                        displayName: `${pin.name}, India`,
                        latitude: pin.lat,
                        longitude: pin.lon,
                        country: 'India',
                        countryCode: 'IN'
                      })}
                      className="mt-3 w-full py-1.5 text-xs font-semibold rounded-xl bg-[#173D32] hover:bg-[#245543] text-[#F7F5ED] transition-colors"
                    >
                      Select Active Telemetry
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Clean Standard Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 border border-[#E3E6DC] rounded-2xl p-3.5 shadow-card backdrop-blur-md">
          <p className="text-[10px] font-bold text-[#89938A] uppercase tracking-wider mb-2 font-heading">
            CPCB / US EPA Index
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-[11px]">
            {Object.values(AQI_CATEGORIES).map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-[#26332D] font-medium">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Click-to-Sample Floating Drawer */}
        {sampledLocation && (
          <div className="absolute top-4 right-4 z-[400] w-80 bg-white border border-[#E3E6DC] rounded-2xl p-5 shadow-card backdrop-blur-md animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EEF1E8] text-[#173D32] uppercase font-heading">
                  Sampled Location
                </span>
                <p className="font-bold font-heading text-[#173D32] text-sm mt-1">{sampledLocation.name}</p>
                <p className="text-xs text-[#58645C]">{sampledLocation.displayName}</p>
              </div>
              <button
                onClick={() => setSampledLocation(null)}
                className="text-[#89938A] hover:text-[#26332D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sampledWaqi ? (
              <div className="mt-3.5 pt-3 border-t border-[#E3E6DC] text-xs space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[#58645C]">Ground Station AQI:</span>
                  <span className="text-lg font-bold font-mono text-[#26332D]">{sampledWaqi.aqi}</span>
                </div>
                {sampledWaqi.pollutants.pm25 && (
                  <div className="flex justify-between text-[11px] text-[#58645C] font-mono">
                    <span>PM2.5:</span>
                    <span>{sampledWaqi.pollutants.pm25} µg/m³</span>
                  </div>
                )}
                {sampledWaqi.attributions?.[0] && (
                  <p className="text-[10px] text-[#89938A] truncate pt-1">
                    Feed: {sampledWaqi.attributions[0].name}
                  </p>
                )}
              </div>
            ) : null}

            <button
              onClick={() => {
                setSelectedLocation(sampledLocation);
                setSampledLocation(null);
              }}
              className="mt-4 w-full py-2 rounded-xl bg-[#173D32] hover:bg-[#245543] text-[#F7F5ED] font-semibold text-xs font-heading transition-colors flex items-center justify-center gap-1.5 shadow-soft"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Load Full Telemetry Here</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
