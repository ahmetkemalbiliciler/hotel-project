import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelService } from '../services/api';
import FormField from '../components/FormField';
import { useAuth } from 'react-oidc-context';

export default function Hotels() {
    const navigate = useNavigate();
    const auth = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        city: '',
        location: { lat: '', lng: '' }
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Konum yoksa payload'dan çıkar
        const payload = { ...formData };
        if (!payload.location.lat || !payload.location.lng) {
            delete payload.location;
        }

        try {
            const result = await hotelService.createHotel(auth.user?.access_token, payload);
            setSuccess(true);
            // 1.5 sn sonra oda eklemeye yönlendir
            setTimeout(() => {
                navigate('/rooms', { state: { hotelId: result.hotelId, hotelName: formData.name } });
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
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Otel Başarıyla Oluşturuldu!</h2>
                <p className="text-slate-500">Oda ekleme sayfasına yönlendiriliyorsunuz...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Yeni Otel Ekle</h1>
                <p className="text-slate-500">Otel detaylarını ve konum bilgilerini giriniz.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <FormField
                    label="Otel Adı"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Grand İstanbul Hotel"
                    required
                />

                <FormField
                    label="Şehir"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Örn: İstanbul"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        label="Enlem (Opsiyonel)"
                        type="number"
                        step="any"
                        value={formData.location.lat}
                        onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, lat: parseFloat(e.target.value) }
                        })}
                        placeholder="Örn: 41.0082"
                    />
                    <FormField
                        label="Boylam (Opsiyonel)"
                        type="number"
                        step="any"
                        value={formData.location.lng}
                        onChange={(e) => setFormData({
                            ...formData,
                            location: { ...formData.location, lng: parseFloat(e.target.value) }
                        })}
                        placeholder="Örn: 28.9784"
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
                        {loading ? 'İşleniyor...' : 'Oteli Oluştur'}
                    </button>
                </div>
            </form>
        </div>
    );
}
