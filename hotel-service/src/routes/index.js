import express from "express";
import adminRouter from "./admin.route.js";
import publicRouter from "./public.route.js";

const router = express.Router();

router.use("/admin", adminRouter);
router.use("/", publicRouter);

export default router;
