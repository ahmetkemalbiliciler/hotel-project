import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { availabilityService, pricePredictionService } from '../services/api';
import { roomTypes, hotelTypes, getCapacityByRoomType } from '../constants';

export default function Availability() {
    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [predicting, setPredicting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [predictedPrice, setPredictedPrice] = useState(null);

    const initialRoomId = location.state?.roomId || '';
    const initialRoomType = location.state?.roomType || '';

    const [formData, setFormData] = useState({
        roomId: initialRoomId,
        startDate: '',
        endDate: '',
        availableCount: '1',
        price: '',
        roomType: initialRoomType || 'Standard',
        hotelType: 'City Hotel',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await availabilityService.create(auth.user?.access_token, formData.roomId, {
                startDate: formData.startDate,
                endDate: formData.endDate,
                availableCount: parseInt(formData.availableCount),
                price: parseFloat(formData.price),
            });

            setSuccess('Müsaitlik başarıyla eklendi!');
            setFormData(prev => ({
                ...prev,
                startDate: '',
                endDate: '',
                availableCount: '1',
                price: '',
            }));
            setPredictedPrice(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = async () => {
        if (!formData.startDate) {
            setError('Fiyat tahmini için başlangıç tarihi gerekli');
            return;
        }

        setPredicting(true);
        setError(null);

        try {
            const capacity = getCapacityByRoomType(formData.roomType);

            const result = await pricePredictionService.predict(auth.user?.access_token, {
                capacity,
                date: formData.startDate,
                hotelType: formData.hotelType,
            });

            setPredictedPrice(result.predictedPrice);
            setFormData(prev => ({ ...prev, price: result.predictedPrice.toString() }));
        } catch (err) {
            setError(err.message);
        } finally {
            setPredicting(false);
        }
    };

    const handleChange = (field) => (value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Müsaitlik Yönetimi</h1>
                <p className="text-slate-500">Oda müsaitliği ve fiyat belirleyin</p>
            </div>

            {initialRoomType && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p className="font-medium text-amber-800">
                        Oda Tipi: <span className="font-bold">{initialRoomType}</span>
                    </p>
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium text-emerald-800">{success}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">Müsaitlik Bilgileri</h3>
                    <p className="text-slate-500 text-sm mt-1">Tarih aralığı ve fiyat belirleyin</p>
                </div>

                <div className="p-6 space-y-6">
                    <FormField
                        label="Oda ID"
                        value={formData.roomId}
                        onChange={handleChange('roomId')}
                        placeholder="Oda ID'sini girin"
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Başlangıç Tarihi"
                            value={formData.startDate}
                            onChange={handleChange('startDate')}
                            type="date"
                            required
                        />
                        <FormField
                            label="Bitiş Tarihi"
                            value={formData.endDate}
                            onChange={handleChange('endDate')}
                            type="date"
                            required
                        />
                    </div>

                    <FormField
                        label="Müsait Oda Sayısı"
                        value={formData.availableCount}
                        onChange={handleChange('availableCount')}
                        type="number"
                        min="1"
                        required
                    />

                    {/* Price Prediction Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <h4 className="font-bold text-purple-800">ML Fiyat Önerisi</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <FormField
                                label="Oda Tipi"
                                value={formData.roomType}
                                onChange={handleChange('roomType')}
                                type="select"
                                options={roomTypes.map(rt => ({ value: rt.value, label: rt.label }))}
                            />
                            <FormField
                                label="Otel Tipi"
                                value={formData.hotelType}
                                onChange={handleChange('hotelType')}
                                type="select"
                                options={hotelTypes.map(ht => ({ value: ht.value, label: ht.label }))}
                            />
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={handlePredict}
                                    disabled={predicting || !formData.startDate}
                                    className="w-full px-4 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {predicting && (
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    )}
                                    {predicting ? 'Tahmin...' : 'Fiyat Öner'}
                                </button>
                            </div>
                        </div>

                        {predictedPrice && (
                            <div className="bg-white rounded-lg p-4 text-center">
                                <p className="text-sm text-purple-600 font-medium mb-1">Önerilen Fiyat</p>
                                <p className="text-3xl font-black text-purple-700">€{predictedPrice}</p>
                                <p className="text-xs text-slate-500 mt-1">ML modeli tarafından hesaplandı</p>
                            </div>
                        )}
                    </div>

                    <FormField
                        label="Gecelik Fiyat (€)"
                        value={formData.price}
                        onChange={handleChange('price')}
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Fiyat girin veya yukarıdan öneri alın"
                        required
                    />
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/rooms')}
                        className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                    >
                        ← Önce Oda Ekle
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.roomId || !formData.startDate || !formData.endDate || !formData.price}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {loading ? 'Kaydediliyor...' : 'Müsaitlik Ekle'}
                    </button>
                </div>
            </form>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="font-medium text-blue-800">ML Model Hakkında</p>
                        <p className="text-sm text-blue-700 mt-1">
                            Fiyat tahminleri; ay, kapasite ve otel tipi (City/Resort) özelliklerini kullanarak hesaplanır.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
