// backend/routes/index.js
const express = require('express');
const router = express.Router();

const healthController = require('../controllers/healthController');
const dbController = require('../controllers/dbController');
const authRoutes = require('./auth');
const userRoutes = require('./users');

router.get('/health', healthController.health);
router.get('/db', dbController.dbStatus);

// auth prefix
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

router.get('/', (req, res) => {
  res.json({ service: 'hms-backend', version: '0.1.0' });
});

module.exports = router;
