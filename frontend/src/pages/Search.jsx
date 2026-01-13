import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import SearchForm from '../components/SearchForm';
import HotelCard from '../components/HotelCard';
import { hotelService } from '../services/api';

export default function Search() {
    const [searchParams] = useSearchParams();
    const auth = useAuth();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const city = searchParams.get('city');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const guests = searchParams.get('guests');

    useEffect(() => {
        if (city && startDate && endDate && guests) {
            fetchHotels();
        }
    }, [city, startDate, endDate, guests, auth.isAuthenticated]);

    const fetchHotels = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = auth.isAuthenticated ? auth.user?.access_token : null;
            const results = await hotelService.search(token, {
                city,
                startDate,
                endDate,
                guests: parseInt(guests),
            });
            setHotels(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getNights = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="animate-fade-in">
            {/* Search Bar */}
            <div className="bg-white shadow-sm py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <SearchForm
                        compact
                        initialValues={{ city, startDate, endDate, guests }}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Results Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {city ? `${city} Hotels` : 'Search Results'}
                        </h1>
                        <p className="text-slate-500">
                            {hotels.length} hotels found • {getNights()} nights • {guests} guests
                        </p>
                    </div>

                    {auth.isAuthenticated && (
                        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg text-emerald-700 text-sm font-medium">
                            ✨ Member special 10% discount applied!
                        </div>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* No Results */}
                {!loading && !error && hotels.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🏨</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Hotels Found</h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            No hotels found matching your criteria. Please try different dates or a different city.
                        </p>
                    </div>
                )}

                {/* Results Grid */}
                {!loading && hotels.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hotels.map((hotel, index) => (
                            <HotelCard
                                key={`${hotel.hotelId}-${hotel.room.roomId}-${index}`}
                                hotel={hotel}
                                searchParams={{ city, startDate, endDate, guests }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
