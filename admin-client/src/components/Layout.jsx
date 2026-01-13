import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

export default function Layout() {
    const auth = useAuth();
    const navigate = useNavigate();

    const signOutRedirect = () => {
        const clientId = "1o15vekt2a1ihnemat290bdh15";
        const logoutUri = window.location.origin;
        const cognitoDomain = "https://eu-north-1icdnng3yv.auth.eu-north-1.amazoncognito.com";
        auth.removeUser();
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    const navItems = [
        { path: '/', label: 'Panel', icon: '📊' },
        { path: '/hotels', label: 'Otel Ekle', icon: '🏨' },
        { path: '/rooms', label: 'Oda Ekle', icon: '🛏️' },
        { path: '/availability', label: 'Müsaitlik', icon: '📅' },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        H
                    </div>
                    <span className="font-bold text-xl text-slate-800">HotelAdmin</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            <span className="text-xl">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-xl p-4 mb-3">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Giriş Yapıldı</p>
                        <p className="text-sm font-medium text-slate-900 truncate" title={auth.user?.profile.email}>
                            {auth.user?.profile.email}
                        </p>
                    </div>
                    <button
                        onClick={signOutRedirect}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
