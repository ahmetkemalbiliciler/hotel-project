import { pool } from "../db/index.js";
import { sendBookingNotification } from "./queue.service.js";
import NodeCache from "node-cache";

const searchCache = new NodeCache({ stdTTL: 600 });

export async function searchHotels(
  city,
  startDate,
  endDate,
  guests,
  hasDiscount = false,
  limit = 10,
  offset = 0
) {
  const cacheKey = `${city}_${startDate}_${endDate}_${guests}_${hasDiscount}_${limit}_${offset}`;
  const cachedData = searchCache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const discount = hasDiscount ? 0.1 : 0;

  const { rows } = await pool.query(
    `
     SELECT
       h.id   AS hotel_id,
       h.name AS hotel_name,
       h.city,
       h.latitude,
       h.longitude,
       r.id   AS room_id,
       r.type,
       r.capacity,
       a.price,
       a.available_count
     FROM hotels h
     JOIN rooms r ON r.hotel_id = h.id
     JOIN availability a ON a.room_id = r.id
     WHERE h.city = $1
       AND a.start_date <= $2
       AND a.end_date   >= $3
       AND r.capacity   >= $4
       AND a.available_count > 0
     ORDER BY a.price ASC
     LIMIT $5 OFFSET $6
     `,
    [city, startDate, endDate, guests, limit, offset]
  );

  const results = rows.map((row) => {
    const finalPrice = discount
      ? Number(row.price) * (1 - discount)
      : Number(row.price);

    return {
      hotelId: row.hotel_id,
      hotelName: row.hotel_name,
      city: row.city,
      location: {
        lat: row.latitude,
        lng: row.longitude,
      },
      room: {
        roomId: row.room_id,
        type: row.type,
        capacity: row.capacity,
      },
      pricePerNight: finalPrice,
      availableCount: row.available_count,
    };
  });

  searchCache.set(cacheKey, results);
  return results;
}

export async function createBooking({
  roomId,
  userId,
  startDate,
  endDate,
  userEmail,
  hotelName,
  roomType,
  pricePerNight,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const availabilityRes = await client.query(
      `
      SELECT id, available_count, price
      FROM availability
      WHERE room_id = $1
        AND start_date <= $2
        AND end_date   >= $3
        AND available_count > 0
      FOR UPDATE
      `,
      [roomId, startDate, endDate]
    );

    if (availabilityRes.rowCount === 0) {
      throw new Error("NO_AVAILABILITY");
    }

    const availability = availabilityRes.rows[0];

    await client.query(
      `
      UPDATE availability
      SET available_count = available_count - 1
      WHERE id = $1
      `,
      [availability.id]
    );

    const reservationRes = await client.query(
      `
      INSERT INTO reservations (room_id, user_id, start_date, end_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [roomId, userId, startDate, endDate]
    );

    await client.query("COMMIT");

    const booking = reservationRes.rows[0];

    // Gece sayısı hesapla
    const nights = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = (pricePerNight || availability.price) * nights;

    // Notification Service'e detaylı bilgi gönder
    try {
      await sendBookingNotification({
        type: "NEW_RESERVATION",
        bookingId: booking.id,
        roomId,
        userId,
        userEmail: userEmail || "Bilinmiyor",
        hotelName: hotelName || "Bilinmiyor",
        roomType: roomType || "Bilinmiyor",
        startDate,
        endDate,
        nights,
        pricePerNight: pricePerNight || Number(availability.price),
        totalPrice,
        timestamp: new Date().toISOString(),
      });
    } catch (notificationError) {
      console.error("Failed to queue booking notification:", notificationError);
    }

    return booking;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
