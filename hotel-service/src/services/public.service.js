import { pool } from "../db/index.js";

export async function searchHotels(
  city,
  startDate,
  endDate,
  guests,
  hasDiscount = false
) {
  // Login kontrolü (opsiyonel)
  const discount = hasDiscount ? 0.1 : 0; // %10

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
     `,
    [city, startDate, endDate, guests]
  );

  // Fiyat indirimi uygula
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
  return results;
}

export async function createBooking({
  roomId,
  userId, // Cognito sub
  startDate,
  endDate,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1) Uygun availability var mı? (kilitle)
    const availabilityRes = await client.query(
      `
      SELECT id, available_count
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

    // 2) Capacity düş
    await client.query(
      `
      UPDATE availability
      SET available_count = available_count - 1
      WHERE id = $1
      `,
      [availability.id]
    );

    // 3) Reservation oluştur
    const reservationRes = await client.query(
      `
      INSERT INTO reservations (room_id, user_id, start_date, end_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [roomId, userId, startDate, endDate]
    );

    await client.query("COMMIT");

    return reservationRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
