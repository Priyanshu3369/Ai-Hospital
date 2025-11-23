const express = require("express");
const router = express.Router();

const schedule = require("../controllers/scheduleController");
const protect = require("../middleware/auth");
const authorizeRoles = require("../middleware/roles");

// ADMIN or DOCTOR can set doctor schedule
router.post(
  "/:doctorId",
  protect,
  authorizeRoles("admin", "doctor"),
  schedule.upsertSchedule
);

// get schedule
router.get(
  "/:doctorId",
  protect,
  authorizeRoles("admin", "doctor", "nurse", "receptionist"),
  schedule.getSchedule
);

// check slot availability
router.get(
  "/check/:doctorId",
  protect,
  authorizeRoles("admin", "doctor", "nurse", "receptionist"),
  schedule.checkSlot
);

module.exports = router;
