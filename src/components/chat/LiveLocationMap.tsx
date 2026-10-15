"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LiveLocationMapProps {
  lat: number;
  lng: number;
  className?: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function LiveLocationMap({
  lat,
  lng,
  className = "h-48 md:h-56 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800",
}: LiveLocationMapProps) {
  const center = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

  const markerIcon = useMemo(() => {
    return L.divIcon({
      className: "custom-live-seller-marker",
      html: `
        <div style="position: relative; width: 28px; height: 28px;">
          <div style="position: absolute; inset: 0; background-color: #f97316; opacity: 0.35; border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 2px; background-color: #ea580c; border: 2.5px solid white; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; background-color: white; border-radius: 9999px;"></div>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, []);

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        dragging={true}
        className="h-full w-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={markerIcon} />
        <MapUpdater center={center} />
      </MapContainer>
    </div>
  );
}
