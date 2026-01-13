const API_BASE_URL = 'https://tvhn5liy45.execute-api.eu-north-1.amazonaws.com/prod/api/v1';

// Token'ı almak için helper
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

// Hotel Service
export const hotelService = {
  create: async (token, { name, city, latitude = 0, longitude = 0 }) => {
    const response = await fetch(`${API_BASE_URL}/admin/hotels`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ name, city, latitude, longitude }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Hotel oluşturulamadı');
    }

    return response.json();
  },
};

// Room Service
export const roomService = {
  create: async (token, hotelId, { type, capacity }) => {
    const response = await fetch(`${API_BASE_URL}/admin/hotels/${hotelId}/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ type, capacity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Oda eklenemedi');
    }

    return response.json();
  },
};

// Availability Service
export const availabilityService = {
  create: async (token, roomId, { startDate, endDate, availableCount, price }) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms/${roomId}/availability`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ startDate, endDate, availableCount, price }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Müsaitlik eklenemedi');
    }

    return response.json();
  },
};

// Price Prediction Service
export const pricePredictionService = {
  predict: async (token, { capacity, date, hotelType }) => {
    const params = new URLSearchParams({ capacity, date, hotelType });
    const response = await fetch(`${API_BASE_URL}/admin/predict-price?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Fiyat tahmini alınamadı');
    }

    return response.json();
  },
};

// Hotel arama (public)
export const publicService = {
  searchHotels: async (token, { city, startDate, endDate, guests, limit = 10, offset = 0 }) => {
    const params = new URLSearchParams({
      city,
      startDate,
      endDate,
      guests: guests.toString(),
      limit: limit.toString(),
      offset: offset.toString()
    });

    const headers = token
      ? { 'Authorization': `Bearer ${token}` }
      : {};

    const response = await fetch(`${API_BASE_URL}/hotels/search?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Otel araması başarısız');
    }

    return response.json();
  },
};
