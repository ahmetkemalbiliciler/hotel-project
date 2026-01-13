const API_BASE_URL = 'https://tvhn5liy45.execute-api.eu-north-1.amazonaws.com/prod/api/v1';

const getAuthHeaders = (token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const hotelService = {
    search: async (token, { city, startDate, endDate, guests, limit = 10, offset = 0 }) => {
        const params = new URLSearchParams({
            city,
            startDate,
            endDate,
            guests: guests.toString(),
            limit: limit.toString(),
            offset: offset.toString(),
        });

        const response = await fetch(`${API_BASE_URL}/hotels/search?${params}`, {
            method: 'GET',
            headers: getAuthHeaders(token),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Arama başarısız');
        }

        return response.json();
    },
};

export const reservationService = {
    create: async (token, { roomId, startDate, endDate, hotelName, roomType, pricePerNight }) => {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ roomId, startDate, endDate, hotelName, roomType, pricePerNight }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Rezervasyon başarısız');
        }

        return response.json();
    },
};
