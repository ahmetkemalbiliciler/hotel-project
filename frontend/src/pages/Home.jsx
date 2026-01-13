import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import SearchForm from '../components/SearchForm';

const popularDestinations = [
    { city: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop', hotels: 234 },
    { city: 'London', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop', hotels: 189 },
    { city: 'İstanbul', image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=300&fit=crop', hotels: 312 },
    { city: 'Rome', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop', hotels: 156 },
];

export default function Home() {
    const navigate = useNavigate();
    const auth = useAuth();

    const handleDestinationClick = (city) => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        navigate(`/search?city=${city}&startDate=${today}&endDate=${tomorrow}&guests=2`);
    };

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=1080&fit=crop)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70" />

                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                        Discover Your
                        <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Dream Hotel
                        </span>
                    </h1>
                    <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto">
                        Stay at thousands of hotels worldwide at the best prices.
                        {!auth.isAuthenticated && ' Sign up now to get a 10% discount!'}
                    </p>

                    {/* Search Form */}
                    <SearchForm />
                </div>
            </section>

            {/* Discount Banner */}
            {!auth.isAuthenticated && (
                <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-6">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-white text-center md:text-left">
                            <p className="font-bold text-lg">🎉 Sign Up, Get 10% Off!</p>
                            <p className="text-indigo-100 text-sm">Special discount valid for all hotels</p>
                        </div>
                        <button
                            onClick={() => auth.signinRedirect()}
                            className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            Sign Up Now
                        </button>
                    </div>
                </section>
            )}

            {/* Popular Destinations */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Popular Destinations</h2>
                    <p className="text-slate-500 mb-8">Most preferred cities</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {popularDestinations.map((dest) => (
                            <button
                                key={dest.city}
                                onClick={() => handleDestinationClick(dest.city)}
                                className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                            >
                                <img
                                    src={dest.image}
                                    alt={dest.city}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-left">
                                    <h3 className="text-2xl font-bold">{dest.city}</h3>
                                    <p className="text-slate-200 text-sm">{dest.hotels}+ hotels</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Email Info */}
            <section className="py-12 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                        <div className="text-4xl mb-4">📧</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Booking Confirmation Sent via Email</h3>
                        <p className="text-slate-500">
                            All details will be sent to your email address once your booking is complete.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
