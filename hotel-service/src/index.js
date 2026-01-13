import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db/index.js";
import { requireAuth } from "./middlewares/authMiddleware.js";
import { requireAdmin } from "./middlewares/requireAdmin.js";
import router from "./routes/index.js";
import { trainModel } from "./services/ml.service.js";

const app = express();
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json());
const PORT = process.env.PORT || 8080;

// Train ML model on startup
trainModel().catch((err) => console.error("ML Training Error:", err));

app.get("/db-test", async (req, res) => {
  const { rows } = await pool.query("SELECT NOW()");
  res.json(rows[0]);
});

app.get("/health", requireAuth, requireAdmin, (req, res) => {
  res.json({
    message: "Authenticated",
    user: req.user.sub,
  });
});

app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`Hotel Service is running on port ${PORT}`);
});
