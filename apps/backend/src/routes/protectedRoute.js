import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/admin-only", authMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Hello Admin!" });
});

export default router;
