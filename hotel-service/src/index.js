import "dotenv/config";
import express from "express";
import { requireAuth } from "./middlewares/authMiddleware.js";
import { requireAdmin } from "./middlewares/requireAdmin.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/health", requireAuth, requireAdmin, (req, res) => {
  res.json({
    message: "Authenticated",
    user: req.user.sub,
  });
});

app.listen(PORT, () => {
  console.log(`Hotel Service is running on port ${PORT}`);
});
