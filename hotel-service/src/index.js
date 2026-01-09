import "dotenv/config";
import express from "express";
import { pool } from "./db/index.js";
import { requireAuth } from "./middlewares/authMiddleware.js";
import { requireAdmin } from "./middlewares/requireAdmin.js";
import router from "./routes/index.js";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

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

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Hotel Service is running on port ${PORT}`);
});
