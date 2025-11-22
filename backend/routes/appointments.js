// backend/routes/appointments.js
const express = require('express');
const router = express.Router();
const appointment = require('../controllers/appointmentController');
const protect = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');

/**
 * Create appointment:
 * Admin / Receptionist / Doctor can create
 */
router.post(
  '/',
  protect,
  authorizeRoles('admin', 'receptionist', 'doctor'),
  appointment.createAppointment
);

/**
 * Check availability (any authenticated user)
 * Query params: doctorId, start, end
 */
router.get(
  '/availability',
  protect,
  appointment.checkAvailability
);

/**
 * List appointments (doctors/nurses/admin)
 */
router.get(
  '/',
  protect,
  authorizeRoles('admin', 'doctor', 'nurse'),
  appointment.listAppointments
);

/**
 * Update appointment (doctor/admin can update, receptionist maybe not)
 */
router.put(
  '/:id',
  protect,
  authorizeRoles('admin', 'doctor'),
  appointment.updateAppointment
);

/**
 * Cancel appointment (created-by, doctor or admin)
 * We'll allow admin and doctor; also allow creator (createdBy)
 */
router.delete(
  '/:id',
  protect,
  async (req, res, next) => {
    // custom inline check: allow admin, doctor, or appointment creator
    try {
      const Appointment = require('../models/Appointment');
      const appt = await Appointment.findById(req.params.id);
      if (!appt) return res.status(404).json({ error: 'Appointment not found' });

      // allow if admin or doctor role
      if (req.user.role === 'admin' || req.user.role === 'doctor' || appt.createdBy.toString() === req.user.id) {
        return next();
      }

      return res.status(403).json({ error: 'Forbidden to cancel this appointment' });
    } catch (err) {
      next(err);
    }
  },
  appointment.cancelAppointment
);

module.exports = router;
