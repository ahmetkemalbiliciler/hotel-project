import { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// City coordinates (Normalized case)
const cityCoordinates = {
    'paris': [48.8566, 2.3522],
    'london': [51.5074, -0.1278],
    'londra': [51.5074, -0.1278],
    'rome': [41.9028, 12.4964],
    'roma': [41.9028, 12.4964],
    'berlin': [52.5200, 13.4050],
    'madrid': [40.4168, -3.7038],
    'amsterdam': [52.3676, 4.9041],
    'vienna': [48.2082, 16.3738],
    'viyana': [48.2082, 16.3738],
    'prague': [50.0755, 14.4378],
    'prag': [50.0755, 14.4378],
    'barcelona': [41.3851, 2.1734],
    'budapest': [47.4979, 19.0402],
    'budapeşte': [47.4979, 19.0402],
    'istanbul': [41.0082, 28.9784],
    'i̇stanbul': [41.0082, 28.9784],
    'ankara': [39.9334, 32.8597],
    'izmir': [38.4237, 27.1428],
    'i̇zmir': [38.4237, 27.1428],
    'antalya': [36.8969, 30.7133],
    'bursa': [40.1885, 29.0610],
};

function normalizeCity(city) {
    if (!city) return '';
    return city.toLowerCase();
}

export default function MapModal({ isOpen, onClose, hotel }) {
    const mapRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize();
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen || !hotel) return null;

    // Default: Istanbul
    let position = [41.0082, 28.9784];
    let isCityCenter = false;

    // 1. Hotel coordinates check (must not be 0)
    const lat = Number(hotel.location?.lat);
    const lng = Number(hotel.location?.lng);

    if (lat && lng && lat !== 0 && lng !== 0) {
        position = [lat, lng];
    }
    // 2. City coordinates check
    else if (hotel.city) {
        const normalizedCity = normalizeCity(hotel.city);
        const cityCoord = cityCoordinates[normalizedCity] ||
            cityCoordinates[hotel.city.toLowerCase()] ||
            Object.entries(cityCoordinates).find(([k]) => k.includes(normalizedCity))?.[1];

        if (cityCoord) {
            position = cityCoord;
            isCityCenter = true;
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all w-full max-w-3xl">

                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="text-2xl">🗺️</span>
                            {hotel.hotelName} Location
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="h-[400px] w-full bg-slate-100 relative z-10" style={{ minHeight: '400px' }}>
                        <MapContainer
                            key={`${position[0]}-${position[1]}-${isOpen}`}
                            center={position}
                            zoom={13}
                            style={{ height: '400px', width: '100%' }}
                            ref={mapRef}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            <Marker position={position}>
                                <Popup>
                                    <div className="text-center">
                                        <strong className="block mb-1">{hotel.hotelName}</strong>
                                        <span className="text-slate-600 text-xs">{hotel.city}</span>
                                        {isCityCenter && (
                                            <p className="text-[10px] text-slate-400 mt-1 italic">(City Center)</p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>

                    <div className="bg-slate-50 p-4 border-t flex justify-between items-center text-sm text-slate-500">
                        <span>{hotel.city}</span>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        >
                            Open in Google Maps
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
