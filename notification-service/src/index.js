import express from "express";
import dotenv from "dotenv";
import { pollMessages } from "./services/sqsWorker.js";
import { initCapacityCron } from "./services/capacityCheck.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Notification Service is running" });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
  pollMessages(); // Start SQS polling
  initCapacityCron(); // Start nightly capacity check
});
