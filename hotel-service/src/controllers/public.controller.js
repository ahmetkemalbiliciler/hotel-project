import { searchHotels as searchHotelsService } from "../services/public.service.js";
import { createBooking as createBookingService } from "../services/public.service.js";

export async function searchHotels(req, res) {
  const { city, startDate, endDate, guests, limit, offset } = req.query;

  if (!city || !startDate || !endDate || !guests) {
    return res.status(400).json({
      message: "city, startDate, endDate and guests are required",
    });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ message: "Invalid date range" });
  }

  const hasDiscount = !!req.headers.authorization;
  const hotels = await searchHotelsService(
    city,
    startDate,
    endDate,
    guests,
    hasDiscount,
    parseInt(limit) || 10,
    parseInt(offset) || 0
  );

  res.json(hotels);
}

export async function createBooking(req, res) {
  const { roomId, startDate, endDate, hotelName, roomType, pricePerNight } = req.body;
  const userId = req.user.sub;
  const userEmail = req.user.email || req.user["cognito:username"];

  if (!roomId || !startDate || !endDate) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ message: "Invalid date range" });
  }

  try {
    const reservation = await createBookingService({
      roomId,
      userId,
      startDate,
      endDate,
      userEmail,
      hotelName,
      roomType,
      pricePerNight,
    });

    res.status(201).json(reservation);
  } catch (err) {
    if (err.message === "NO_AVAILABILITY") {
      return res
        .status(409)
        .json({ message: "No availability for selected dates" });
    }

    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
}
