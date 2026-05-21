import { Router } from "express";
import { getDb } from "../db/database.js";
import { mapWilayaRow } from "../utils/donorMapper.js";

const router = Router();

router.get("/", (_req, res) => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM wilayas ORDER BY name ASC").all();
  res.json(rows.map(mapWilayaRow));
});

export default router;
