import { Router } from "express";
import { createDoctor, getDoctors, deleteDoctor } from "../controllers/doctorController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware(["admin"]), createDoctor);
router.get("/", authMiddleware(["admin", "receptionist", "doctor"]), getDoctors);
router.delete("/:id", authMiddleware(["admin"]), deleteDoctor);

export default router;
