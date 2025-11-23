const DoctorSchedule = require("../models/DoctorSchedule");

/****************************************************
 * CREATE OR UPDATE DOCTOR SCHEDULE
 ****************************************************/
exports.upsertSchedule = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;

    const { weeklySchedule } = req.body;
    if (!weeklySchedule) {
      return res.status(400).json({ error: "weeklySchedule is required" });
    }

    // Check if schedule exists
    const existing = await DoctorSchedule.findOne({ doctor: doctorId });

    if (existing) {
      existing.weeklySchedule = weeklySchedule;
      existing.updatedBy = req.user.id;
      await existing.save();

      return res.json({
        message: "Schedule updated successfully",
        schedule: existing,
      });
    }

    // Create new schedule
    const schedule = await DoctorSchedule.create({
      doctor: doctorId,
      weeklySchedule,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    });
  } catch (err) {
    next(err);
  }
};

/****************************************************
 * GET DOCTOR SCHEDULE
 ****************************************************/
exports.getSchedule = async (req, res, next) => {
  try {
    const schedule = await DoctorSchedule.findOne({
      doctor: req.params.doctorId,
    });

    if (!schedule)
      return res.status(404).json({ error: "Schedule not found" });

    return res.json({ schedule });
  } catch (err) {
    next(err);
  }
};

/****************************************************
 * CHECK SLOT AVAILABILITY (FOR APPOINTMENT MODULE)
 ****************************************************/
exports.checkSlot = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { day, start, end } = req.query;

    const schedule = await DoctorSchedule.findOne({ doctor: doctorId });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const daySchedule = schedule.weeklySchedule.find(
      (d) => d.day === day.toLowerCase()
    );

    if (!daySchedule) {
      return res.json({ available: false, reason: "Not working this day" });
    }

    const conflict = daySchedule.slots.some((slot) => {
      return !(end <= slot.start || start >= slot.end);
    });

    return res.json({
      available: !conflict,
      reason: conflict ? "Slot conflict" : "Available",
    });
  } catch (err) {
    next(err);
  }
};
