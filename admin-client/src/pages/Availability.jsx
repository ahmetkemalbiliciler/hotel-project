import { useState, useEffect } from 'react';
import { hotelService, availabilityService, pricePredictionService } from '../services/api';
import FormField from '../components/FormField';
import { useAuth } from 'react-oidc-context';

export default function Availability() {
    const auth = useAuth();
    const [hotels, setHotels] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [selectedHotel, setSelectedHotel] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');

    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        priceMultiplier: 1.0,
        availableCount: ''
    });

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        if (selectedHotel) {
            fetchRooms(selectedHotel);
        } else {
            setRooms([]);
            setSelectedRoom('');
        }
    }, [selectedHotel]);

    // Oda seçilince varsayılan stok sayısını otomatik dolduralım (isteğe bağlı)
    useEffect(() => {
        if (selectedRoom) {
            const room = rooms.find(r => r.id === selectedRoom);
            if (room) {
                // Burada mevcut stoğu çekmek için ayrı bir endpoint gerekebilir
                // Şimdilik varsayılan boş bırakıyoruz veya 5 yapıyoruz test için
                setFormData(prev => ({ ...prev, availableCount: 5 }));
            }
        }
    }, [selectedRoom, rooms]);


    const fetchHotels = async () => {
        try {
            const data = await hotelService.getHotels(auth.user?.access_token);
            setHotels(data);
        } catch (err) {
            console.error('Oteller yüklenemedi:', err);
        }
    };

    const fetchRooms = async (hotelId) => {
        try {
            const data = await hotelService.getHotelRooms(auth.user?.access_token, hotelId);
            setRooms(data);
        } catch (err) {
            console.error('Odalar yüklenemedi:', err);
        }
    };

    const handlePredictPrice = async () => {
        if (!selectedHotel || !selectedRoom || !formData.startDate) {
            setError('Lütfen fiyat tahmini için otel, oda ve başlangıç tarihi seçin.');
            return;
        }

        setLoading(true);
        setPrediction(null);
        setError(null);

        try {
            const hotel = hotels.find(h => h.id === selectedHotel);
            const room = rooms.find(r => r.id === selectedRoom);

            const result = await pricePredictionService.predict(auth.user?.access_token, {
                hotelType: hotel.name.toLowerCase().includes('resort') ? 'Resort Hotel' : 'City Hotel',
                roomType: room.type,
                month: new Date(formData.startDate).getMonth() + 1 // 1-12
            });

            setPrediction(result.predicted_price);
        } catch (err) {
            setError('Fiyat tahmini alınamadı: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyPrediction = () => {
        if (prediction) {
            // Tahmin edilen fiyatı doğrudan kullanamıyoruz çünkü biz multiplier gönderiyoruz.
            // Ancak kullanıcıya bunu baz alarak bir multiplier önerebiliriz.
            // Şimdilik sadece bilgilendirme amacı güdüyoruz.
            alert(`Önerilen Fiyat: €${prediction.toFixed(2)}. Lütfen çarpanı buna göre ayarlayın.`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await availabilityService.updateAvailability(auth.user?.access_token, selectedRoom, {
                startDate: formData.startDate,
                endDate: formData.endDate,
                priceMultiplier: parseFloat(formData.priceMultiplier),
                availableCount: parseInt(formData.availableCount)
            });

            setSuccess(true);
            // Formu sıfırlamak yerine koruyabiliriz, kullanıcı art arda işlem yapabilir
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Müsaitlik Yönetimi</h1>
                <p className="text-slate-500">Belirli tarih aralıkları için oda stoklarını ve fiyatlarını güncelleyin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Ana Form */}
                <form onSubmit={handleSubmit} className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Otel Seç"
                            type="select"
                            value={selectedHotel}
                            onChange={(e) => setSelectedHotel(e.target.value)}
                            options={[
                                { value: '', label: 'Otel Seçiniz' },
                                ...hotels.map(h => ({ value: h.id, label: h.name }))
                            ]}
                            required
                        />

                        <FormField
                            label="Oda Seç"
                            type="select"
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            options={[
                                { value: '', label: 'Oda Seçiniz' },
                                ...rooms.map(r => ({ value: r.id, label: `${r.type} (Kap: ${r.capacity})` }))
                            ]}
                            disabled={!selectedHotel}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Başlangıç Tarihi"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                        <FormField
                            label="Bitiş Tarihi"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Fiyat Çarpanı (1.0 = Baz)"
                            type="number"
                            step="0.1"
                            value={formData.priceMultiplier}
                            onChange={(e) => setFormData({ ...formData, priceMultiplier: e.target.value })}
                            placeholder="1.0"
                            required
                        />
                        <FormField
                            label="Müsait Oda Sayısı"
                            type="number"
                            value={formData.availableCount}
                            onChange={(e) => setFormData({ ...formData, availableCount: e.target.value })}
                            placeholder="5"
                            required
                        />
                    </div>

                    {success && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
                            <span>✓</span> Müsaitlik başarıyla güncellendi!
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'İşleniyor...' : 'Müsaitliği Güncelle'}
                        </button>
                    </div>
                </form>

                {/* AI Tahmin Paneli */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🤖</span>
                            <h2 className="font-bold text-lg">AI Fiyat Tahmini</h2>
                        </div>
                        <p className="text-indigo-100 text-sm mb-6">
                            Piyasa verileri ve talep analizine dayalı olarak en uygun fiyat tahminini alın.
                        </p>

                        {prediction ? (
                            <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/20">
                                <p className="text-indigo-200 text-xs uppercase font-bold mb-1">Önerilen Fiyat</p>
                                <p className="text-3xl font-bold">€{prediction.toFixed(0)}</p>
                                <button
                                    onClick={applyPrediction}
                                    className="text-xs text-white underline mt-2 hover:text-indigo-200"
                                >
                                    Çarpanı Kontrol Et
                                </button>
                            </div>
                        ) : (
                            <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/20 rounded-xl mb-4">
                                <p className="text-sm text-indigo-200">Sonuç burada görünecek</p>
                            </div>
                        )}

                        <button
                            onClick={handlePredictPrice}
                            disabled={loading || !selectedRoom || !formData.startDate}
                            className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {loading ? 'Analiz Ediliyor...' : 'Tahmin Al'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
