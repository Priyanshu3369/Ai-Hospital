// backend/routes/patients.js
const express = require('express');
const router = express.Router();

const patient = require('../controllers/patientController');
const protect = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');

// Receptionist+Doctor+Nurse+Admin can create patients
router.post(
  '/',
  protect,
  authorizeRoles('admin', 'doctor', 'nurse', 'receptionist'),
  patient.createPatient
);

// Doctor+Nurse+Admin can read patient data
router.get(
  '/',
  protect,
  authorizeRoles('admin', 'doctor', 'nurse'),
  patient.getAllPatients
);

// Get single patient
router.get(
  '/:id',
  protect,
  authorizeRoles('admin', 'doctor', 'nurse'),
  patient.getPatient
);

// Update patient (Doctor, Nurse, Admin)
router.put(
  '/:id',
  protect,
  authorizeRoles('admin', 'doctor', 'nurse'),
  patient.updatePatient
);

// Soft delete patient (Admin only)
router.delete(
  '/:id',
  protect,
  authorizeRoles('admin'),
  patient.deletePatient
);

module.exports = router;
