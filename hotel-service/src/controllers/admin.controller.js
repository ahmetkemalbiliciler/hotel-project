import { pool } from "../db/index.js";
import {
  createHotel as createHotelService,
  addRoom as addRoomService,
  addAvailability as addAvailabilityService,
} from "../services/admin.service.js";

export async function createHotel(req, res) {
  const { name, city, latitude, longitude } = req.body;

  if (!name || !city) {
    return res.status(400).json({ message: "Name and city are required" });
  }

  const hotel = await createHotelService(name, city, latitude, longitude);

  res.status(201).json(hotel);
}

export async function addRoom(req, res) {
  const { hotelId } = req.params;
  const { type, capacity } = req.body;

  if (!type || !capacity) {
    return res.status(400).json({ message: "Type and capacity are required" });
  }

  const room = await addRoomService(hotelId, type, capacity);

  res.status(201).json(room);
}

export async function addAvailability(req, res) {
  const { roomId } = req.params;
  const { startDate, endDate, availableCount, price } = req.body;

  if (!startDate || !endDate || !availableCount || !price) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ message: "Invalid date range" });
  }

  const availability = await addAvailabilityService(
    roomId,
    startDate,
    endDate,
    availableCount,
    price
  );
  res.status(201).json(availability);
}
