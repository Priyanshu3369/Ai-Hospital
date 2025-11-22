// backend/controllers/patientController.js
const Patient = require('../models/Patient');

/**********************************************************
 * CREATE PATIENT
 **********************************************************/
exports.createPatient = async (req, res, next) => {
  try {
    const data = req.body;

    if (!data.fullName || !data.phone || !data.age || !data.gender || !data.bloodGroup) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const patient = await Patient.create({
      ...data,
      createdBy: req.user.id
    });

    return res.status(201).json({
      message: "Patient created successfully",
      patient
    });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * GET ALL PATIENTS (WITH PAGINATION + SEARCH + FILTERS)
 **********************************************************/
exports.getAllPatients = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(parseInt(req.query.limit || "20"), 100);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    // text search
    if (req.query.q) {
      const q = req.query.q.trim();
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } }
      ];
    }

    // filters
    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;

    if (req.query.minAge || req.query.maxAge) {
      filter.age = {};
      if (req.query.minAge) filter.age.$gte = parseInt(req.query.minAge);
      if (req.query.maxAge) filter.age.$lte = parseInt(req.query.maxAge);
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-isDeleted"),
      Patient.countDocuments(filter)
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      patients
    });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * GET SINGLE PATIENT
 **********************************************************/
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!patient) return res.status(404).json({ error: "Patient not found" });

    return res.json({ patient });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * UPDATE PATIENT
 **********************************************************/
exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!patient) return res.status(404).json({ error: "Patient not found" });

    Object.assign(patient, req.body);
    patient.updatedBy = req.user.id;

    await patient.save();

    return res.json({
      message: "Patient updated",
      patient
    });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * SOFT DELETE PATIENT
 **********************************************************/
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) return res.status(404).json({ error: "Patient not found" });

    patient.isDeleted = true;
    patient.updatedBy = req.user.id;

    await patient.save();

    return res.json({ message: "Patient deleted" });
  } catch (err) {
    next(err);
  }
};
