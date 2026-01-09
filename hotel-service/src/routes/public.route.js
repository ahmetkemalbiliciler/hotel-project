import express from "express";

import { searchHotels } from "../controllers/public.controller.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { createBooking } from "../controllers/public.controller.js";

const router = express.Router();

router.get("/hotels/search", searchHotels);
router.post("/reservations", requireAuth, createBooking);

export default router;
