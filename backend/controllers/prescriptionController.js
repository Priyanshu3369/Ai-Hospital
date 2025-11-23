// backend/controllers/prescriptionController.js
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');

/**
 * Create prescription
 * POST /api/prescriptions
 * Role: doctor (and admin maybe)
 */
exports.createPrescription = async (req, res, next) => {
  try {
    const { patient, medications, notes } = req.body;

    if (!patient || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ error: 'patient and medications array required' });
    }

    // ensure patient exists
    const p = await Patient.findOne({ _id: patient, isDeleted: false });
    if (!p) return res.status(404).json({ error: 'Patient not found' });

    const prescription = await Prescription.create({
      patient,
      prescribedBy: req.user.id,
      medications,
      notes
    });

    return res.status(201).json({ message: 'Prescription created', prescription });
  } catch (err) {
    next(err);
  }
};

/**
 * List prescriptions for a patient
 * GET /api/prescriptions?patient=<id>
 * Roles: doctor, nurse, admin, patient (only own)
 */
exports.listPrescriptions = async (req, res, next) => {
  try {
    const { patient } = req.query;
    if (!patient) return res.status(400).json({ error: 'patient query param required' });

    // patients can only view their own
    if (req.user.role === 'patient' && req.user.id !== patient) {
      return res.status(403).json({ error: 'Patients can only access their own prescriptions' });
    }

    const page = Math.max(parseInt(req.query.page || '1'), 1);
    const limit = Math.min(parseInt(req.query.limit || '20'), 200);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Prescription.find({ patient })
        .populate('prescribedBy', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Prescription.countDocuments({ patient })
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single prescription
 * GET /api/prescriptions/:id
 */
exports.getPrescription = async (req, res, next) => {
  try {
    const pres = await Prescription.findById(req.params.id).populate('prescribedBy', 'fullName email role');
    if (!pres) return res.status(404).json({ error: 'Prescription not found' });

    if (req.user.role === 'patient' && pres.patient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Patients can only access their own prescriptions' });
    }

    return res.json({ prescription: pres });
  } catch (err) {
    next(err);
  }
};

/**
 * Update prescription (doctor who prescribed or admin)
 * PUT /api/prescriptions/:id
 */
exports.updatePrescription = async (req, res, next) => {
  try {
    const pres = await Prescription.findById(req.params.id);
    if (!pres) return res.status(404).json({ error: 'Prescription not found' });

    // Only prescribing doctor or admin may update
    if (req.user.role !== 'admin' && pres.prescribedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only prescribing doctor or admin can update' });
    }

    const { medications, notes, status } = req.body;
    if (medications !== undefined) {
      if (!Array.isArray(medications) || medications.length === 0) {
        return res.status(400).json({ error: 'medications must be a non-empty array' });
      }
      pres.medications = medications;
    }
    if (notes !== undefined) pres.notes = notes;
    if (status !== undefined) pres.status = status;

    pres.updatedBy = req.user.id;
    await pres.save();

    return res.json({ message: 'Prescription updated', prescription: pres });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel prescription (doctor or admin)
 * DELETE /api/prescriptions/:id
 * Here we mark status as cancelled
 */
exports.cancelPrescription = async (req, res, next) => {
  try {
    const pres = await Prescription.findById(req.params.id);
    if (!pres) return res.status(404).json({ error: 'Prescription not found' });

    if (req.user.role !== 'admin' && pres.prescribedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only prescribing doctor or admin can cancel' });
    }

    pres.status = 'cancelled';
    pres.updatedBy = req.user.id;
    await pres.save();

    return res.json({ message: 'Prescription cancelled', prescription: pres });
  } catch (err) {
    next(err);
  }
};
