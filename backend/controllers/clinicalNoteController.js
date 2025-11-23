// backend/controllers/clinicalNoteController.js
const ClinicalNote = require('../models/ClinicalNote');
const Patient = require('../models/Patient');

/**
 * Create clinical note
 * POST /api/clinical-notes
 * Roles: doctor, nurse, admin (author must be authenticated user)
 */
exports.createNote = async (req, res, next) => {
  try {
    const { patient, noteText, tags, visibility } = req.body;
    if (!patient || !noteText) {
      return res.status(400).json({ error: 'patient and noteText are required' });
    }

    // ensure patient exists and is not deleted
    const p = await Patient.findOne({ _id: patient, isDeleted: false });
    if (!p) return res.status(404).json({ error: 'Patient not found' });

    const note = await ClinicalNote.create({
      patient,
      authoredBy: req.user.id,
      noteText,
      tags: tags || [],
      visibility: visibility || 'team'
    });

    return res.status(201).json({ message: 'Clinical note created', note });
  } catch (err) {
    next(err);
  }
};

/**
 * Get notes for a patient (paginated)
 * GET /api/clinical-notes?patient=<id>&page=1&limit=20
 * Roles: admin, doctor, nurse, patient (but patient only their own)
 */
exports.listNotes = async (req, res, next) => {
  try {
    const { patient } = req.query;
    if (!patient) return res.status(400).json({ error: 'patient query param required' });

    // if requester is a patient, ensure they are requesting their own notes
    if (req.user.role === 'patient' && req.user.id !== patient) {
      return res.status(403).json({ error: 'Patients can only access their own notes' });
    }

    const page = Math.max(parseInt(req.query.page || '1'), 1);
    const limit = Math.min(parseInt(req.query.limit || '20'), 200);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ClinicalNote.find({ patient })
        .populate('authoredBy', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ClinicalNote.countDocuments({ patient })
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
 * Get single note
 * GET /api/clinical-notes/:id
 * Roles: admin, doctor, nurse, patient(owner)
 */
exports.getNote = async (req, res, next) => {
  try {
    const note = await ClinicalNote.findById(req.params.id).populate('authoredBy', 'fullName email role');
    if (!note) return res.status(404).json({ error: 'Note not found' });

    if (req.user.role === 'patient' && note.patient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Patients can only access their own notes' });
    }

    return res.json({ note });
  } catch (err) {
    next(err);
  }
};

/**
 * Update note (only author or admin can update)
 * PUT /api/clinical-notes/:id
 */
exports.updateNote = async (req, res, next) => {
  try {
    const note = await ClinicalNote.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Only author or admin can update
    if (req.user.role !== 'admin' && note.authoredBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only author or admin can update this note' });
    }

    const { noteText, tags, visibility } = req.body;
    if (noteText !== undefined) note.noteText = noteText;
    if (tags !== undefined) note.tags = tags;
    if (visibility !== undefined) note.visibility = visibility;
    note.updatedBy = req.user.id;

    await note.save();
    return res.json({ message: 'Note updated', note });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete note (soft or hard). We'll hard-delete for simplicity but log who did it.
 * DELETE /api/clinical-notes/:id
 * Only admin or author
 */
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await ClinicalNote.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    if (req.user.role !== 'admin' && note.authoredBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only author or admin can delete this note' });
    }

    await note.deleteOne();
    return res.json({ message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
};
