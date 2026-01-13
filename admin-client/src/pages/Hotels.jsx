import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { hotelService } from '../services/api';
import { cities } from '../constants';

export default function Hotels() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [createdHotel, setCreatedHotel] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        city: '',
        latitude: '',
        longitude: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const hotel = await hotelService.create(auth.user?.access_token, {
                name: formData.name,
                city: formData.city,
                latitude: parseFloat(formData.latitude) || 0,
                longitude: parseFloat(formData.longitude) || 0,
            });

            setCreatedHotel(hotel);
            setSuccess(`"${hotel.name}" oteli başarıyla oluşturuldu!`);
            setFormData({ name: '', city: '', latitude: '', longitude: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field) => (value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Otel Yönetimi</h1>
                    <p className="text-slate-500">Yeni otel kaydı oluşturun</p>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-medium text-emerald-800">{success}</p>
                        {createdHotel && (
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => navigate('/rooms', { state: { hotelId: createdHotel.id, hotelName: createdHotel.name } })}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                                >
                                    Bu Otele Oda Ekle →
                                </button>
                                <button
                                    onClick={() => { setSuccess(null); setCreatedHotel(null); }}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                                >
                                    Yeni Otel Ekle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium text-red-800">{error}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">Yeni Otel Bilgileri</h3>
                    <p className="text-slate-500 text-sm mt-1">Otel detaylarını girin</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Otel Adı"
                            value={formData.name}
                            onChange={handleChange('name')}
                            placeholder="Örn: Grand Palace Hotel"
                            required
                        />
                        <FormField
                            label="Şehir"
                            value={formData.city}
                            onChange={handleChange('city')}
                            type="select"
                            options={cities}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Enlem (Latitude)"
                            value={formData.latitude}
                            onChange={handleChange('latitude')}
                            type="number"
                            placeholder="Örn: 41.0082"
                            step="0.0001"
                        />
                        <FormField
                            label="Boylam (Longitude)"
                            value={formData.longitude}
                            onChange={handleChange('longitude')}
                            type="number"
                            placeholder="Örn: 28.9784"
                            step="0.0001"
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !formData.name || !formData.city}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {loading ? 'Oluşturuluyor...' : 'Otel Oluştur'}
                    </button>
                </div>
            </form>
        </div>
    );
}
