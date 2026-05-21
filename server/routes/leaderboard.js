import { Router } from "express";
import { getDb } from "../db/database.js";
import { mapDonorRow } from "../utils/donorMapper.js";

const router = Router();

router.get("/", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT d.*, l.rank_order
       FROM leaderboard l
       JOIN donors d ON d.id = l.donor_id
       ORDER BY l.rank_order ASC`
    )
    .all();

  res.json(
    rows.map((row) => {
      const donor = mapDonorRow(row);
      return {
        id: donor.id,
        name: donor.name,
        bloodType: donor.bloodType,
        wilaya: donor.wilaya,
        totalDonations: donor.totalDonations,
        points: donor.points,
        rank: row.rank_order,
      };
    })
  );
});

export default router;
