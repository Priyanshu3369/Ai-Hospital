import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createPatient, getPatients, deletePatient } from "../controllers/patientController.js";

const router = Router();

router.post("/", authMiddleware(["admin", "receptionist"]), createPatient);
router.get("/", authMiddleware(["admin", "doctor", "receptionist", "nurse"]), getPatients);
router.delete("/:id", authMiddleware(["admin"]), deletePatient);

export default router;
