import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

export default function Header() {
    const auth = useAuth();
    const navigate = useNavigate();

    const signOutRedirect = () => {
        const clientId = '1o15vekt2a1ihnemat290bdh15';
        const logoutUri = window.location.origin;
        const cognitoDomain = 'https://eu-north-1icdnng3yv.auth.eu-north-1.amazoncognito.com';
        auth.removeUser();
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            HotelBooking
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                            Home
                        </Link>
                    </nav>

                    {/* Auth */}
                    <div className="flex items-center gap-4">
                        {auth.isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {auth.user?.profile.email?.[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm text-slate-600">{auth.user?.profile.email}</span>
                                </div>
                                <button
                                    onClick={signOutRedirect}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => auth.signinRedirect()}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
