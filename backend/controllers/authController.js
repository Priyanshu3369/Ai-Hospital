// backend/controllers/authController.js
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  decodeRefreshToken
} = require('../utils/jwt');

// Helper: store refresh token in DB
async function saveRefreshToken(userId, token, expiresIn) {
  const expiresAt = new Date(Date.now() + expiresIn);
  return await RefreshToken.create({
    user: userId,
    token,
    expiresAt,
  });
}

// Register (same as before)
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
      role: role || 'staff',
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      }
    });

  } catch (err) {
    next(err);
  }
};

// LOGIN — creates tokens & stores refresh in DB
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email & password required.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });

    const matches = await user.comparePassword(password);
    if (!matches)
      return res.status(401).json({ error: 'Invalid email or password' });

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    // Create access + refresh token
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store refresh token in DB
    const decoded = decodeRefreshToken(refreshToken);
    const expiresInMs = decoded.exp * 1000 - Date.now();

    await saveRefreshToken(user._id, refreshToken, expiresInMs);

    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    next(err);
  }
};

// REFRESH — verifies old token + rotates with a new refresh token
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(400).json({ error: 'refreshToken required' });

    const dbToken = await RefreshToken.findOne({ token: refreshToken });

    if (!dbToken || dbToken.isRevoked)
      return res.status(403).json({ error: 'Refresh token invalid or revoked' });

    // Verify structure & expiry
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      dbToken.isRevoked = true;
      await dbToken.save();
      return res.status(403).json({ error: 'Refresh token expired' });
    }

    // Rotate: old token becomes revoked
    dbToken.isRevoked = true;
    await dbToken.save();

    // Create new pair
    const payload = { id: decoded.id, email: decoded.email, role: decoded.role };

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    // Store new refresh token
    const decodedNew = decodeRefreshToken(newRefreshToken);
    const expiresInMs = decodedNew.exp * 1000 - Date.now();

    await saveRefreshToken(decoded.id, newRefreshToken, expiresInMs);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (err) {
    next(err);
  }
};

// LOGOUT — revoke token
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const dbToken = await RefreshToken.findOne({ token: refreshToken });
      if (dbToken) {
        dbToken.isRevoked = true;
        await dbToken.save();
      }
    }

    return res.json({ message: 'Logged out successfully' });

  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user });

  } catch (err) {
    next(err);
  }
};
