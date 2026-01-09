import { pool } from "../db/index.js";

export async function createHotel(name, city, latitude, longitude) {
  const { rows } = await pool.query(
    `INSERT INTO hotels (name, city, latitude, longitude)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, city, latitude, longitude]
  );

  return rows[0];
}

export async function addRoom(hotelId, type, capacity) {
  const hotelCheck = await pool.query("SELECT id FROM hotels WHERE id = $1", [
    hotelId,
  ]);

  if (hotelCheck.rowCount === 0) {
    return res.status(404).json({ message: "Hotel not found" });
  }

  const { rows } = await pool.query(
    `INSERT INTO rooms (hotel_id, type, capacity)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [hotelId, type, capacity]
  );

  return rows[0];
}

export async function addAvailability(
  roomId,
  startDate,
  endDate,
  availableCount,
  price
) {
  // Room var mı?
  const roomCheck = await pool.query("SELECT id FROM rooms WHERE id = $1", [
    roomId,
  ]);

  if (roomCheck.rowCount === 0) {
    return res.status(404).json({ message: "Room not found" });
  }

  // Tarih çakışması var mı?
  const overlapCheck = await pool.query(
    `SELECT 1
   FROM availability
   WHERE room_id = $1
     AND NOT (
       end_date <= $2 OR start_date >= $3
     )`,
    [roomId, startDate, endDate]
  );

  if (overlapCheck.rowCount > 0) {
    return res.status(409).json({
      message: "Availability overlaps with existing date range",
    });
  }

  // Insert
  const { rows } = await pool.query(
    `INSERT INTO availability
   (room_id, start_date, end_date, available_count, price)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING *`,
    [roomId, startDate, endDate, availableCount, price]
  );

  return rows[0];
}
