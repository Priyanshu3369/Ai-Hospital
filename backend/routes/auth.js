const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const protect = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');



router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
router.get('/me', protect, auth.me);

// Test RBAC endpoint
router.get(
  '/admin-only',
  protect,
  authorizeRoles('admin'),
  (req, res) => {
    res.json({ message: 'Welcome Admin!' });
  }
);

router.get(
  '/doctor-nurse',
  protect,
  authorizeRoles('doctor', 'nurse'),
  (req, res) => {
    res.json({ message: 'Doctors and Nurses can access this' });
  }
);


module.exports = router;