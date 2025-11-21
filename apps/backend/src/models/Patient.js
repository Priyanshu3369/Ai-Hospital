import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String },
    bloodGroup: { type: String },
    emergencyContact: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
