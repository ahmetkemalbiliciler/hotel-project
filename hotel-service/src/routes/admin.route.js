import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import {
  createHotel,
  addRoom,
  addAvailability,
  getPredictedPrice,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/predict-price", requireAuth, requireAdmin, getPredictedPrice);
router.post("/hotels", requireAuth, requireAdmin, createHotel);

router.post("/hotels/:hotelId/rooms", requireAuth, requireAdmin, addRoom);

router.post(
  "/rooms/:roomId/availability",
  requireAuth,
  requireAdmin,
  addAvailability
);

export default router;
