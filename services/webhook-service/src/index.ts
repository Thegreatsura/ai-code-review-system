import express from "express";
import { logger } from "@repo/logger";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "webhook-service" });
});

app.post("/webhook", (req, res) => {
  logger.info({ body: req.body }, "PR Event received");
  res.sendStatus(200);
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Webhook service started");
});
