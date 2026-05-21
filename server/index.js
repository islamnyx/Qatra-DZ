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
import bloodRouter from "./routes/blood.js";
import nexusRouter from "./routes/nexus.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

try {
  getDb();
} catch (err) {
  console.error("Database failed to open:", err.message);
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;
app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/donors", donorsRouter);
app.use("/api/sos", sosRouter);
app.use("/api/wilayas", wilayasRouter);
app.use("/api/feed", feedRouter);
app.use("/api/chat", chatRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/blood", bloodRouter);
app.use("/api/nexus", nexusRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT);

server.on("listening", () => {
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : PORT;
  console.log(`Qatra API running at http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error("Stop the other process: close the other terminal or run:");
    console.error("  npx kill-port 3001");
    console.error("Then: npm start\n");
  } else {
    console.error("Server error:", err.message);
  }
  process.exit(1);
});
