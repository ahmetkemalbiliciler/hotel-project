import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import MapModal from './MapModal';

export default function HotelCard({ hotel, searchParams }) {
    const navigate = useNavigate();
    const auth = useAuth();
    const [isMapOpen, setIsMapOpen] = useState(false);

    const handleBook = () => {
        navigate('/booking', {
            state: {
                hotel,
                searchParams,
            },
        });
    };

    // Placeholder images based on hotel name hash
    const imageIndex = Math.abs(hotel.hotelName.charCodeAt(0) % 6) + 1;
    const placeholderImage = `https://images.unsplash.com/photo-${['1566073771259-6a8506099945', '1582719508461-905c673771fd', '1551882547-ff40c63fe5fa',
            '1520250497591-112f2f40a3f4', '1445019980597-93fa8acb246c', '1571896349842-33c89424de2d'][imageIndex - 1]
        }?w=400&h=300&fit=crop`;

    return (
        <>
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={placeholderImage}
                        alt={hotel.hotelName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {auth.isAuthenticated && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            10% Discount
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">{hotel.hotelName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-slate-500 text-sm flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {hotel.city}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMapOpen(true);
                                    }}
                                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                    title="Show on Map"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-indigo-600">€{hotel.pricePerNight.toFixed(0)}</p>
                            <p className="text-xs text-slate-400">/ night</p>
                        </div>
                    </div>

                    {/* Room Info */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            {hotel.room.type}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {hotel.room.capacity} guests
                        </span>
                        <span className="text-emerald-600 font-medium">
                            {hotel.availableCount} rooms left
                        </span>
                    </div>

                    {/* Book Button */}
                    <button
                        onClick={handleBook}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
                    >
                        Book Now
                    </button>
                </div>
            </div>

            <MapModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                hotel={hotel}
            />
        </>
    );
}
