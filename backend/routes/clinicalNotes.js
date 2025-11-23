// backend/routes/clinicalNotes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/clinicalNoteController');
const protect = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');

// Create note: doctor, nurse, admin, receptionist? (we allow receptionist to create basic note)
router.post('/', protect, authorizeRoles('admin', 'doctor', 'nurse', 'receptionist'), controller.createNote);

// List notes for a patient: admin, doctor, nurse, patient
router.get('/', protect, authorizeRoles('admin', 'doctor', 'nurse', 'patient'), controller.listNotes);

// Get single note
router.get('/:id', protect, authorizeRoles('admin', 'doctor', 'nurse', 'patient'), controller.getNote);

// Update note
router.put('/:id', protect, controller.updateNote); // controller enforces author/admin check

// Delete note
router.delete('/:id', protect, controller.deleteNote); // controller enforces author/admin check

module.exports = router;
