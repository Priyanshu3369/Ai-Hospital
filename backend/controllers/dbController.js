const mongoose = require('mongoose');
const { mapState } = require('../config/db');

exports.dbStatus = (req, res) => {
  const readyState = mongoose.connection.readyState;
  const payload = {
    service: 'hms-backend',
    mongodb: {
      readyState,
      state: mapState(readyState),
      host: mongoose.connection.host || null,
      port: mongoose.connection.port || null,
      name: mongoose.connection.name || null
    },
    timestamp: new Date().toISOString()
  };

  // If not connected, return 503 to indicate DB not ready
  if (readyState !== 1) {
    return res.status(503).json({ status: 'unavailable', ...payload });
  }

  return res.json({ status: 'ok', ...payload });
};
