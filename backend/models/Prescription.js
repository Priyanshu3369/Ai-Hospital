// backend/models/Prescription.js
const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String },     // e.g., "500 mg"
  frequency: { type: String },  // e.g., "twice a day"
  durationDays: { type: Number }, // e.g., 5
  instructions: { type: String } // e.g., "after meals"
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    medications: {
      type: [MedicationSchema],
      required: true,
      validate: v => Array.isArray(v) && v.length > 0
    },
    notes: { type: String }, // additional instructions
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    // audit
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

PrescriptionSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
