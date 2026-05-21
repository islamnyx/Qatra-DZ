import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    ok: true,
    app: "Qatra API",
    version: "1.0.0",
    message: "Backend is running",
  });
});

export default router;
