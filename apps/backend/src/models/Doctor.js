import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    experience: { type: Number },
    availableDays: [{ type: String }], // ["Mon","Tue","Fri"]
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
