import Doctor from "../models/Doctor.js";

export const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ message: "Doctor Added", doctor });
  } catch (err) {
    res.status(500).json({ message: "Error creating doctor", err });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Error fetching doctors", err });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting doctor", err });
  }
};
