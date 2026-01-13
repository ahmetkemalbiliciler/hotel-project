import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();

    const quickActions = [
        {
            title: 'Yeni Otel Ekle',
            description: 'Sisteme yeni bir otel kaydı oluşturun',
            path: '/hotels',
            color: 'indigo',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
        {
            title: 'Oda Ekle',
            description: 'Mevcut otellere yeni odalar ekleyin',
            path: '/rooms',
            color: 'emerald',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            ),
        },
        {
            title: 'Müsaitlik & Fiyat',
            description: 'Oda müsaitliği ve ML fiyat tahmini ile fiyatları belirleyin',
            path: '/availability',
            color: 'purple',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];

    const colorClasses = {
        indigo: {
            bg: 'bg-indigo-100',
            text: 'text-indigo-600',
            hover: 'hover:border-indigo-500 hover:bg-indigo-50',
            groupHover: 'group-hover:bg-indigo-600 group-hover:text-white',
        },
        emerald: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-600',
            hover: 'hover:border-emerald-500 hover:bg-emerald-50',
            groupHover: 'group-hover:bg-emerald-600 group-hover:text-white',
        },
        purple: {
            bg: 'bg-purple-100',
            text: 'text-purple-600',
            hover: 'hover:border-purple-500 hover:bg-purple-50',
            groupHover: 'group-hover:bg-purple-600 group-hover:text-white',
        },
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-black mb-2">Hoş Geldiniz! 👋</h1>
                <p className="text-indigo-100 text-lg">
                    Hotel Admin panelinden otellerinizi, odalarınızı ve fiyatlarınızı yönetebilirsiniz.
                </p>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Hızlı İşlemler</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => {
                        const colors = colorClasses[action.color];
                        return (
                            <button
                                key={action.path}
                                onClick={() => navigate(action.path)}
                                className={`p-6 rounded-xl border border-slate-200 ${colors.hover} transition-all flex items-center gap-4 group text-left`}
                            >
                                <div className={`p-3 ${colors.bg} ${colors.text} rounded-lg ${colors.groupHover} transition-colors`}>
                                    {action.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{action.title}</p>
                                    <p className="text-sm text-slate-500">{action.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold mb-4 text-slate-800">Kullanım Akışı</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                            <p className="font-medium text-slate-800">Otel Oluştur</p>
                            <p className="text-sm text-slate-500">Yeni otel kaydı ekleyin</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center">
                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <div className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                            <p className="font-medium text-slate-800">Oda Ekle</p>
                            <p className="text-sm text-slate-500">Otele odalar tanımlayın</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center">
                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <div className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                            <p className="font-medium text-slate-800">Müsaitlik & Fiyat</p>
                            <p className="text-sm text-slate-500">ML ile fiyat belirleyin</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Room Types Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold mb-4 text-slate-800">Oda Tipleri</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="font-bold text-indigo-600">Standard</p>
                        <p className="text-sm text-slate-500">2 kişi</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="font-bold text-indigo-600">Double</p>
                        <p className="text-sm text-slate-500">2 kişi</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="font-bold text-indigo-600">Triple</p>
                        <p className="text-sm text-slate-500">3 kişi</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
