// backend/models/Patient.js
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    age: { type: Number, required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      required: true
    },
    address: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String }
    },

    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', PatientSchema);
