// Oda tipleri
export const roomTypes = [
    { value: 'Standard', label: 'Standard', capacity: 2 },
    { value: 'Double', label: 'Double', capacity: 2 },
    { value: 'Triple', label: 'Triple', capacity: 3 },
];

// Otel tipleri
export const hotelTypes = [
    { value: 'City Hotel', label: 'City Hotel' },
    { value: 'Resort Hotel', label: 'Resort Hotel' },
];

// Şehirler
export const cities = [
    'Paris', 'London', 'Rome', 'Berlin', 'Madrid',
    'Amsterdam', 'Vienna', 'Prague', 'Barcelona', 'Budapest',
    'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'
];

// Oda tipine göre kapasite al
export const getCapacityByRoomType = (roomType) => {
    const type = roomTypes.find(rt => rt.value === roomType);
    return type?.capacity || 2;
};
