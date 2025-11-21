// backend/controllers/userController.js
const User = require('../models/User');

/**
 * POST /api/users
 * Admin creates a new user (doctor/nurse/receptionist/admin/staff)
 */
exports.createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'fullName, email and password are required.' });
    }

    // Prevent non-admin from creating an admin (shouldn't be reachable if RBAC works)
    const requestedRole = role || 'staff';

    // Check duplicate
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already exists.' });

    const user = await User.create({
      fullName,
      email,
      password,
      role: requestedRole
    });

    return res.status(201).json({
      message: 'User created',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users
 * List users (admin). Supports pagination: ?page=1&limit=20&role=doctor
 */
exports.listUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.q) {
      const q = req.query.q.trim();
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
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
 * GET /api/users/:id
 * Return single user (no password)
 */
exports.getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id
 * Update user fields (admin). If password provided, it will be hashed by pre-save hook.
 */
exports.updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { fullName, email, role, password } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (email && email !== user.email) {
      // check duplicate email
      const exists = await User.findOne({ email });
      if (exists && exists._id.toString() !== id) {
        return res.status(409).json({ error: 'Email already in use by another account.' });
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (password) user.password = password; // will be hashed by pre('save')

    await user.save();

    return res.json({
      message: 'User updated',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 * Soft-delete or hard-delete — chosen here as hard-delete for simplicity.
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await user.deleteOne();

    return res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
