// backend/routes/prescriptions.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/prescriptionController');
const protect = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');

// Create prescription: only doctor & admin allowed
router.post('/', protect, authorizeRoles('admin', 'doctor'), controller.createPrescription);

// List prescriptions for a patient: admin, doctor, nurse, patient
router.get('/', protect, authorizeRoles('admin', 'doctor', 'nurse', 'patient'), controller.listPrescriptions);

// Get single prescription
router.get('/:id', protect, authorizeRoles('admin', 'doctor', 'nurse', 'patient'), controller.getPrescription);

// Update prescription
router.put('/:id', protect, controller.updatePrescription); // controller enforces author/admin check

// Cancel prescription
router.delete('/:id', protect, controller.cancelPrescription); // controller enforces author/admin check

module.exports = router;
