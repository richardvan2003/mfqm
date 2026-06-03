import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface Props {
  center: [number, number];
  bearing: number | null;
  palaceName: string;
}

// 修正 Leaflet Marker 圖標在 React 中的顯示問題
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// 用於自動更新地圖視角的小組件
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
    // 延遲刷新以確保尺寸正確
    setTimeout(() => map.invalidateSize(), 100);
  }, [center, map]);
  return null;
};

const DirectionMap: React.FC<Props> = ({ center, bearing, palaceName }) => {
  const [lineCoords, setLineCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    if (bearing !== null) {
      const radius = 0.05; 
      const lat1 = center[0] * Math.PI / 180;
      const lon1 = center[1] * Math.PI / 180;
      const brng = bearing * Math.PI / 180;

      const lat2 = Math.asin(Math.sin(lat1) * Math.cos(radius) +
        Math.cos(lat1) * Math.sin(radius) * Math.cos(brng));
      const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(radius) * Math.cos(lat1),
        Math.cos(radius) - Math.sin(lat1) * Math.sin(lat2));

      setLineCoords([
        center,
        [lat2 * 180 / Math.PI, lon2 * 180 / Math.PI]
      ]);
    } else {
      setLineCoords([]);
    }
  }, [center, bearing]);

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative mt-6 group">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
      >
        <ChangeView center={center} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <Marker position={center} />
        {lineCoords.length > 0 && (
          <Polyline 
            positions={lineCoords} 
            color="#d4af37" 
            weight={4} 
            opacity={0.8}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
      
      {/* 資訊浮層 */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-yellow-600/30 text-yellow-500 font-bold serif flex items-center space-x-2 text-[10px]">
        <i className="fas fa-compass animate-pulse"></i>
        <span>{palaceName ? `當前方位：${palaceName}` : '請選擇宮位以觀測時空方位'}</span>
      </div>

      {/* 方位導向裝飾 */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[400] text-[8px] text-slate-500 font-bold uppercase tracking-widest opacity-30 pointer-events-none">North</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[400] text-[8px] text-slate-500 font-bold uppercase tracking-widest opacity-30 pointer-events-none">South</div>
    </div>
  );
};

export default DirectionMap;