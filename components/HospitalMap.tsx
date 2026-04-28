"use client";
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (isHovered: boolean, demand: string) => {
  const color = demand === 'high' ? '#C29BFF' : '#FFB4A9';
  const size = isHovered ? 24 : 16;
  const glow = isHovered ? `0 0 20px ${color}, 0 0 40px ${color}` : `0 0 10px ${color}`;
  
  return L.divIcon({
    className: 'custom-hospital-marker bg-transparent border-none',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: ${glow};
      transition: all 0.3s ease;
      transform: translate(-50%, -50%);
    "></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const MapRecenter = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

interface Hospital {
  id: string;
  name: string;
  distance: string;
  demand: string;
}

interface HospitalMapProps {
  hospitals: Hospital[];
  hoveredHospital: string | null;
  mapCenter: [number, number];
  mapZoom: number;
  hospitalCoords: Record<string, [number, number]>;
  defaultCenter: [number, number];
  onRecenter: () => void;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  hospitals,
  hoveredHospital,
  mapCenter,
  mapZoom,
  hospitalCoords,
  defaultCenter,
  onRecenter,
}) => {
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 bg-[#0e0e0f]">
        <MapContainer 
          center={defaultCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%', background: '#0e0e0f' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution="&copy; Google Maps"
            className="map-tiles-filtered"
          />
          <MapRecenter center={mapCenter} zoom={mapZoom} />
          
          {hospitals.map(hospital => {
            const coords = hospitalCoords[hospital.id];
            if (!coords) return null;
            const isHovered = hoveredHospital === hospital.name;
            
            return (
              <Marker 
                key={hospital.id} 
                position={coords}
                icon={createCustomIcon(isHovered, hospital.demand)}
              >
                <Popup className="custom-popup">
                  <div className="font-headline font-bold text-sm text-zinc-900">{hospital.name}</div>
                  <div className="text-xs text-zinc-600">{hospital.distance} away</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
