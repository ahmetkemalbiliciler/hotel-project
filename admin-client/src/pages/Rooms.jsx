import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { hotelService, roomService } from '../services/api';
import FormField from '../components/FormField';
import { ROOM_TYPES } from '../constants';
import { useAuth } from 'react-oidc-context';

export default function Rooms() {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();

    const [hotels, setHotels] = useState([]);
    const [formData, setFormData] = useState({
        hotelId: location.state?.hotelId || '',
        type: 'Standard',
        price: '',
        capacity: 2,
        totalCount: 10
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHotels();
    }, []);

    // Oda tipine göre kapasiteyi otomatik güncelle
    useEffect(() => {
        const selectedType = ROOM_TYPES.find(t => t.id === formData.type);
        if (selectedType) {
            setFormData(prev => ({ ...prev, capacity: selectedType.capacity }));
        }
    }, [formData.type]);

    const fetchHotels = async () => {
        try {
            const data = await hotelService.getHotels(auth.user?.access_token);
            setHotels(data);
        } catch (err) {
            console.error('Oteller yüklenemedi:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Gereksiz alanları temizle
        const payload = {
            type: formData.type,
            price: parseFloat(formData.price),
            capacity: parseInt(formData.capacity),
            totalCount: parseInt(formData.totalCount)
        };

        try {
            // 1. Odayı oluştur
            const room = await roomService.createRoom(auth.user?.access_token, formData.hotelId, payload);

            // 2. Müsaitliği başlat (Initialization)
            await roomService.initializeAvailability(auth.user?.access_token, room.roomId, formData.totalCount);

            setSuccess(true);
            setTimeout(() => {
                navigate('/availability');
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">
                    ✓
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Oda Başarıyla Eklendi!</h2>
                <p className="text-slate-500">Müsaitlik yönetimine yönlendiriliyorsunuz...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Oda Ekle</h1>
                <p className="text-slate-500">Bir otele oda tipi ve stok ekleyin.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <FormField
                    label="Otel Seçin"
                    type="select"
                    value={formData.hotelId}
                    onChange={(e) => setFormData({ ...formData, hotelId: e.target.value })}
                    options={[
                        { value: '', label: 'Otel Seçiniz' },
                        ...hotels.map(h => ({ value: h.id, label: h.name }))
                    ]}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        label="Oda Tipi"
                        type="select"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        options={ROOM_TYPES.map(t => ({ value: t.id, label: t.label }))}
                        required
                    />

                    <FormField
                        label="Taban Fiyat (€)"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        label="Kapasite (Kişi)"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        disabled // Otomatik doluyor
                    />

                    <FormField
                        label="Toplam Oda Sayısı"
                        type="number"
                        value={formData.totalCount}
                        onChange={(e) => setFormData({ ...formData, totalCount: e.target.value })}
                        placeholder="10"
                        required
                    />
                </div>

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
                        {loading ? 'İşleniyor...' : 'Odayı Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}
