// backend/routes/index.js
const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// Health route
router.get('/health', healthController.health);

// Root route - quick index
router.get('/', (req, res) => {
  res.json({ service: 'hms-backend', version: '0.1.0' });
});

module.exports = router;
