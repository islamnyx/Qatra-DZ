import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getDb } from "./db/database.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import donorsRouter from "./routes/donors.js";
import sosRouter from "./routes/sos.js";
import wilayasRouter from "./routes/wilayas.js";
import feedRouter from "./routes/feed.js";
import chatRouter from "./routes/chat.js";
import leaderboardRouter from "./routes/leaderboard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

getDb();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/donors", donorsRouter);
app.use("/api/sos", sosRouter);
app.use("/api/wilayas", wilayasRouter);
app.use("/api/feed", feedRouter);
app.use("/api/chat", chatRouter);
app.use("/api/leaderboard", leaderboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Qatra API running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
