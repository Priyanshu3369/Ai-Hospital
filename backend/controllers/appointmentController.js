// backend/controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

/**
 * Helper: Check if a doctor has any appointment that overlaps with the requested timeslot.
 * Overlap condition: existing.start < newEnd && existing.end > newStart
 */
async function hasConflict(doctorId, startTime, endTime, excludeAppointmentId = null) {
  const query = {
    doctor: mongoose.Types.ObjectId(doctorId),
    status: { $in: ['scheduled'] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } } // overlap
    ]
  };

  if (excludeAppointmentId) {
    query._id = { $ne: mongoose.Types.ObjectId(excludeAppointmentId) };
  }

  const conflict = await Appointment.findOne(query).lean();
  return !!conflict;
}

/**
 * Create appointment
 * POST /api/appointments
 * Body: { patient, doctor, startTime, endTime, reason, location }
 * Roles allowed: admin, doctor, receptionist
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const { patient, doctor, startTime, endTime, reason, location } = req.body;

    if (!patient || !doctor || !startTime || !endTime) {
      return res.status(400).json({ error: 'patient, doctor, startTime and endTime are required.' });
    }

    const s = new Date(startTime);
    const e = new Date(endTime);

    if (isNaN(s) || isNaN(e) || e <= s) {
      return res.status(400).json({ error: 'Invalid startTime/endTime. Ensure ISO date strings and endTime > startTime.' });
    }

    // Check conflict
    const conflict = await hasConflict(doctor, s, e);
    if (conflict) {
      return res.status(409).json({ error: 'Requested timeslot conflicts with existing appointment.' });
    }

    const appt = await Appointment.create({
      patient,
      doctor,
      startTime: s,
      endTime: e,
      reason,
      location,
      createdBy: req.user.id
    });

    return res.status(201).json({ message: 'Appointment created', appointment: appt });
  } catch (err) {
    next(err);
  }
};

/**
 * Check availability
 * GET /api/appointments/availability?doctorId=...&start=...&end=...
 * Returns { available: true|false, conflict: {appointment} | null }
 */
exports.checkAvailability = async (req, res, next) => {
  try {
    const { doctorId, start, end } = req.query;
    if (!doctorId || !start || !end) {
      return res.status(400).json({ error: 'doctorId, start and end query params are required (ISO strings).' });
    }

    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e) || e <= s) {
      return res.status(400).json({ error: 'Invalid start/end times.' });
    }

    const conflict = await Appointment.findOne({
      doctor: mongoose.Types.ObjectId(doctorId),
      status: { $in: ['scheduled'] },
      startTime: { $lt: e },
      endTime: { $gt: s }
    }).populate('patient', 'fullName phone').populate('createdBy', 'fullName email').lean();

    if (conflict) {
      return res.json({ available: false, conflict });
    }
    return res.json({ available: true, conflict: null });
  } catch (err) {
    next(err);
  }
};

/**
 * List appointments by doctor and/or date range
 * GET /api/appointments?doctorId=...&date=YYYY-MM-DD or &from=&to=
 */
exports.listAppointments = async (req, res, next) => {
  try {
    const { doctorId, date, from, to, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.min(parseInt(limit, 10) || 50, 500);
    const skip = (pageNum - 1) * lim;

    const filter = {};

    if (doctorId) filter.doctor = mongoose.Types.ObjectId(doctorId);

    if (date) {
      // get day range in UTC (user should pass date string)
      const dayStart = new Date(date + 'T00:00:00.000Z');
      const dayEnd = new Date(date + 'T23:59:59.999Z');
      filter.startTime = { $lt: dayEnd };
      filter.endTime = { $gt: dayStart };
    } else if (from || to) {
      if (from) {
        filter.endTime = { ...(filter.endTime || {}), $gt: new Date(from) };
      }
      if (to) {
        filter.startTime = { ...(filter.startTime || {}), $lt: new Date(to) };
      }
    }

    // Exclude cancelled/completed depending on need; here return all statuses
    const [items, total] = await Promise.all([
      Appointment.find(filter)
        .populate('patient', 'fullName phone')
        .populate('doctor', 'fullName email')
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Appointment.countDocuments(filter)
    ]);

    return res.json({
      page: pageNum,
      limit: lim,
      total,
      totalPages: Math.ceil(total / lim),
      items
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update appointment (reschedule or change status)
 * PUT /api/appointments/:id
 * Body: { startTime?, endTime?, status?, reason?, location? }
 * Only scheduled appointments can be rescheduled (business rule)
 */
exports.updateAppointment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const { startTime, endTime, status, reason, location } = req.body;

    // If rescheduling provided times, check validity and conflicts
    if (startTime || endTime) {
      const newStart = startTime ? new Date(startTime) : appt.startTime;
      const newEnd = endTime ? new Date(endTime) : appt.endTime;

      if (isNaN(newStart) || isNaN(newEnd) || newEnd <= newStart) {
        return res.status(400).json({ error: 'Invalid reschedule times' });
      }

      // check conflict excluding this appointment
      const conflict = await hasConflict(appt.doctor, newStart, newEnd, id);
      if (conflict) {
        return res.status(409).json({ error: 'New timeslot conflicts with existing appointment.' });
      }

      appt.startTime = newStart;
      appt.endTime = newEnd;
    }

    if (status) appt.status = status;
    if (reason !== undefined) appt.reason = reason;
    if (location !== undefined) appt.location = location;

    appt.updatedBy = req.user.id;
    await appt.save();

    return res.json({ message: 'Appointment updated', appointment: appt });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel appointment (soft change status to 'cancelled')
 * DELETE /api/appointments/:id
 * Only admin or the user who created (or doctor) can cancel — check in routes
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    // Business rule: only allow cancel if scheduled or no-show
    if (appt.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed appointment' });
    }

    appt.status = 'cancelled';
    appt.updatedBy = req.user.id;
    await appt.save();

    return res.json({ message: 'Appointment cancelled', appointment: appt });
  } catch (err) {
    next(err);
  }
};
