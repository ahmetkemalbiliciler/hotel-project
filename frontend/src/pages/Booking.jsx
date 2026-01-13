import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { reservationService } from '../services/api';

export default function Booking() {
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { hotel, searchParams } = location.state || {};

    if (!hotel || !searchParams) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">Hotel Info Not Found</h1>
                <p className="text-slate-500 mb-6">Please select a hotel first.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    const getNights = () => {
        const start = new Date(searchParams.startDate);
        const end = new Date(searchParams.endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const nights = getNights();
    const totalPrice = hotel.pricePerNight * nights;

    const handleBooking = async () => {
        if (!auth.isAuthenticated) {
            auth.signinRedirect();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await reservationService.create(auth.user?.access_token, {
                roomId: hotel.room.roomId,
                startDate: searchParams.startDate,
                endDate: searchParams.endDate,
                hotelName: hotel.hotelName,
                roomType: hotel.room.type,
                pricePerNight: hotel.pricePerNight,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
                <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-4">Booking Confirmed! 🎉</h1>
                <p className="text-slate-500 mb-4">
                    Your reservation for {hotel.hotelName} on {new Date(searchParams.startDate).toLocaleDateString('en-GB')} - {new Date(searchParams.endDate).toLocaleDateString('en-GB')} has been created.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8">
                    <p className="text-emerald-700">📧 Booking details sent to your email address!</p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Complete Booking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hotel Info */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-lg text-slate-800 mb-4">Hotel Information</h2>
                        <div className="flex gap-4">
                            <img
                                src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop`}
                                alt={hotel.hotelName}
                                className="w-32 h-24 object-cover rounded-lg"
                            />
                            <div>
                                <h3 className="font-bold text-slate-800">{hotel.hotelName}</h3>
                                <p className="text-slate-500 text-sm">{hotel.city}</p>
                                <p className="text-slate-600 text-sm mt-2">
                                    {hotel.room.type} • {hotel.room.capacity} guests
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Date Info */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-lg text-slate-800 mb-4">Stay Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Check-in Date</p>
                                <p className="font-bold text-slate-800">{new Date(searchParams.startDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Check-out Date</p>
                                <p className="font-bold text-slate-800">{new Date(searchParams.endDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-slate-600">{nights} nights • {searchParams.guests} guests</p>
                        </div>
                    </div>

                    {/* Login Warning */}
                    {!auth.isAuthenticated && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="text-2xl">⚠️</div>
                                <div>
                                    <h3 className="font-bold text-amber-800 mb-1">Login Required</h3>
                                    <p className="text-amber-700 text-sm mb-3">
                                        You must login to make a reservation. Plus, get a 10% discount as a member!
                                    </p>
                                    <button
                                        onClick={() => auth.signinRedirect()}
                                        className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg text-sm"
                                    >
                                        Login
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Price Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                        <h2 className="font-bold text-lg text-slate-800 mb-4">Price Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-slate-600">
                                <span>€{hotel.pricePerNight.toFixed(2)} x {nights} nights</span>
                                <span>€{totalPrice.toFixed(2)}</span>
                            </div>
                            {auth.isAuthenticated && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Member Discount (10%)</span>
                                    <span>Applied ✓</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 pt-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-slate-800">Total</span>
                                <span className="text-2xl font-black text-indigo-600">€{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleBooking}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {loading ? 'Processing...' : 'Confirm Booking'}
                        </button>

                        <p className="text-xs text-slate-400 text-center mt-4">
                            Your reservation will be confirmed immediately
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
