import express from "express";
import { logger } from "@repo/logger";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-review-worker" });
});

app.post("/review", (req, res) => {
  logger.info({ body: req.body }, "Review request received");
  res.sendStatus(200);
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "AI Review Worker service started");
});
