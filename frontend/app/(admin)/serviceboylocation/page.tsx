'use client';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ServiceBoyData {
  userId: string;
  userName: string;
  position: [number, number];
  lastUpdated: Date;
}

let socket: Socket;

export default function ServiceBoyTracker() {
  const [serviceBoys, setServiceBoys] = useState<Record<string, ServiceBoyData>>({});
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_IMAGE_URL || '';
    socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('Connected to socket:', socket.id);
    });

    socket.on('tracklocation', ({ userId, userName, latitude, longitude }) => {
      console.log({ userId, userName, latitude, longitude });
      if (!userId || latitude == null || longitude == null) return;

      setServiceBoys(prev => ({
        ...prev,
        [userId]: {
          userId,
          userName: userName || 'Unknown ServiceBoy',
          position: [latitude, longitude],
          lastUpdated: new Date(),
        },
      }));
    });

    const activityChecker = setInterval(() => {
      setServiceBoys(prev => {
        const now = new Date().getTime();
        const updated: Record<string, ServiceBoyData> = {};

        Object.values(prev).forEach(sb => {
          if (now - sb.lastUpdated.getTime() <= 120000) {
            updated[sb.userId] = sb;
          }
        });

        return updated;
      });
    }, 30000);

    return () => {
      clearInterval(activityChecker);
      socket.disconnect();
    };
  }, []);

  // Custom marker icon
  const getCustomIcon = (userName: string) =>
    L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="text-align: center;">
          <div style="background: white; width:fit-content; padding: 2px 6px; border-radius: 4px; font-size: 12px; box-shadow: 0 0 2px #888;">
            ${userName}
          </div>
          <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" />
        </div>
      `,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

  const whenCreated = (map: L.Map) => {
    mapRef.current = map;
  };

  const center: [number, number] = [28.7041, 77.1025];

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Service Boy Tracker</h1>
        <div className="flex flex-wrap items-center mt-2 gap-4">
          {Object.values(serviceBoys).length === 0 ? (
            <p>No active service boys</p>
          ) : (
            Object.values(serviceBoys).map(sb => (
              <div key={sb.userId} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <p>
                  {sb.userName} (Last updated: {sb.lastUpdated.toLocaleTimeString()})
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        {Object.values(serviceBoys).length === 0 && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-70 z-10 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-semibold text-gray-800">No Active Service Boy</h2>
              <p className="mt-2 text-gray-600">Waiting for location updates...</p>
            </div>
          </div>
        )}

        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          // whenCreated={whenCreated}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {Object.values(serviceBoys).map(({ userId, userName, position, lastUpdated }) => (
            <Marker
              key={userId}
              position={position}
              icon={getCustomIcon(userName)}
            >
              <Popup>
                <strong>{userName}</strong>
                <p>Latitude: {position[0].toFixed(6)}</p>
                <p>Longitude: {position[1].toFixed(6)}</p>
                <p>Updated: {lastUpdated.toLocaleTimeString()}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
