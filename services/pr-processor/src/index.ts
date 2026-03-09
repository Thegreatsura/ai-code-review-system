import express from "express";
import { logger } from "@repo/logger";

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pr-processor" });
});

app.post("/process", (req, res) => {
  logger.info({ body: req.body }, "PR Process request received");
  res.sendStatus(200);
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "PR Processor service started");
});
