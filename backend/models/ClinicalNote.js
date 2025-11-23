// backend/models/ClinicalNote.js
const mongoose = require('mongoose');

const ClinicalNoteSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    authoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // free text clinical note
    noteText: {
      type: String,
      required: true
    },
    // optional structured tags e.g. diagnosis codes, symptoms
    tags: [{ type: String }],
    // visibility: who can view (optional extension)
    visibility: {
      type: String,
      enum: ['private', 'team', 'public'],
      default: 'team' // team = clinical staff
    },
    // audit
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

ClinicalNoteSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('ClinicalNote', ClinicalNoteSchema);
