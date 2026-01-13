import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();

    const cards = [
        {
            title: 'Yeni Otel Ekle',
            description: 'Yeni bir otel kaydı oluşturun ve konum bilgilerini girin.',
            icon: '🏨',
            action: () => navigate('/hotels'),
            color: 'bg-blue-50 text-blue-700',
        },
        {
            title: 'Oda Ekle',
            description: 'Mevcut otellere standart veya süit odalar ekleyin.',
            icon: '🛏️',
            action: () => navigate('/rooms'),
            color: 'bg-indigo-50 text-indigo-700',
        },
        {
            title: 'Müsaitlik Yönetimi',
            description: 'Odaların fiyatlarını ve uygunluk tarihlerini güncelleyin.',
            icon: '📅',
            action: () => navigate('/availability'),
            color: 'bg-emerald-50 text-emerald-700',
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Yönetim Paneli</h1>
                <p className="text-slate-500 mt-2">Otel yönetim sistemine hoş geldiniz. İşlem yapmak için aşağıdan seçim yapın.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <button
                        key={index}
                        onClick={card.action}
                        className="flex flex-col text-left p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all group"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${card.color}`}>
                            {card.icon}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {card.title}
                        </h3>
                        <p className="text-slate-500 text-sm mt-2">
                            {card.description}
                        </p>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Hızlı İstatistikler</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-slate-500 text-sm mb-1">Toplam Otel</p>
                        <p className="text-2xl font-bold text-slate-900">12</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-slate-500 text-sm mb-1">Aktif Oda</p>
                        <p className="text-2xl font-bold text-slate-900">48</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-slate-500 text-sm mb-1">Rezervasyonlar</p>
                        <p className="text-2xl font-bold text-slate-900">156</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
