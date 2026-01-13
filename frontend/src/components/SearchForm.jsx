import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const cities = [
    'Paris', 'London', 'Rome', 'Berlin', 'Madrid',
    'Amsterdam', 'Vienna', 'Prague', 'Barcelona', 'Budapest',
    'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'
];

export default function SearchForm({ initialValues = {}, compact = false }) {
    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        city: initialValues.city || '',
        startDate: initialValues.startDate || today,
        endDate: initialValues.endDate || tomorrow,
        guests: initialValues.guests || '2',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(formData);
        navigate(`/search?${params}`);
    };

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    if (compact) {
        return (
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
                <select
                    value={formData.city}
                    onChange={handleChange('city')}
                    required
                    className="flex-1 min-w-[150px] px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Select City</option>
                    {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange('startDate')}
                    min={today}
                    required
                    className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange('endDate')}
                    min={formData.startDate || today}
                    required
                    className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                    type="number"
                    value={formData.guests}
                    onChange={handleChange('guests')}
                    min="1"
                    max="10"
                    required
                    className="w-20 px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                    Search
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Where to?</label>
                    <select
                        value={formData.city}
                        onChange={handleChange('city')}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                    >
                        <option value="">Select City</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Check-in Date</label>
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange('startDate')}
                        min={today}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Check-out Date</label>
                    <input
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange('endDate')}
                        min={formData.startDate || today}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Guests</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={formData.guests}
                            onChange={handleChange('guests')}
                            min="1"
                            max="10"
                            required
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                        />
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
