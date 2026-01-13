import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { roomService } from '../services/api';
import { roomTypes, getCapacityByRoomType } from '../constants';

export default function Rooms() {
    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [createdRoom, setCreatedRoom] = useState(null);

    // Hotels sayfasından gelen veri
    const initialHotelId = location.state?.hotelId || '';
    const initialHotelName = location.state?.hotelName || '';

    const [formData, setFormData] = useState({
        hotelId: initialHotelId,
        type: '',
        capacity: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const capacity = formData.capacity || getCapacityByRoomType(formData.type);

            const room = await roomService.create(auth.user?.access_token, formData.hotelId, {
                type: formData.type,
                capacity: parseInt(capacity),
            });

            setCreatedRoom(room);
            setSuccess(`"${formData.type}" tipi oda başarıyla eklendi!`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field) => (value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Oda tipi değiştiğinde otomatik kapasite ayarla
            if (field === 'type') {
                newData.capacity = getCapacityByRoomType(value).toString();
            }

            return newData;
        });
    };

    const handleAddAnother = () => {
        setSuccess(null);
        setCreatedRoom(null);
        setFormData(prev => ({ ...prev, type: '', capacity: '' }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Oda Yönetimi</h1>
                    <p className="text-slate-500">Otellere yeni odalar ekleyin</p>
                </div>
            </div>

            {/* Hotel Info Banner */}
            {initialHotelName && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="font-medium text-indigo-800">
                        Otel: <span className="font-bold">{initialHotelName}</span>
                    </p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-medium text-emerald-800">{success}</p>
                        {createdRoom && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                                <button
                                    onClick={() => navigate('/availability', { state: { roomId: createdRoom.id, roomType: formData.type } })}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                                >
                                    Bu Odaya Müsaitlik Ekle →
                                </button>
                                <button
                                    onClick={handleAddAnother}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                                >
                                    Başka Oda Ekle
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
                    <h3 className="text-lg font-bold text-slate-800">Yeni Oda Bilgileri</h3>
                    <p className="text-slate-500 text-sm mt-1">Oda detaylarını girin</p>
                </div>

                <div className="p-6 space-y-6">
                    <FormField
                        label="Otel ID"
                        value={formData.hotelId}
                        onChange={handleChange('hotelId')}
                        placeholder="Otel ID'sini girin (veya Otel Yönetimi'nden seçin)"
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Oda Tipi"
                            value={formData.type}
                            onChange={handleChange('type')}
                            type="select"
                            options={roomTypes.map(rt => ({ value: rt.value, label: rt.label }))}
                            required
                        />
                        <FormField
                            label="Kapasite (Kişi Sayısı)"
                            value={formData.capacity}
                            onChange={handleChange('capacity')}
                            type="number"
                            min="1"
                            max="10"
                            placeholder="Otomatik ayarlanır"
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/hotels')}
                        className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                    >
                        ← Önce Otel Oluştur
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.hotelId || !formData.type}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {loading ? 'Ekleniyor...' : 'Oda Ekle'}
                    </button>
                </div>
            </form>
        </div>
    );
}
