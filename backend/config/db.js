// backend/config/db.js
const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/hms-dev';

/**
 * Map mongoose readyState number to a readable string
 */
function mapState(state) {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting, 99 = uninitialized
  const map = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  return map[state] || String(state);
}

async function connectToDatabase(uri) {
  const mongoUri = uri || process.env.MONGO_URI || DEFAULT_URI;

  // Basic options for stable connection
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  };

  try {
    // Only call connect if not already connected/connecting
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      console.log('MongoDB: already connected or connecting. State:', mapState(mongoose.connection.readyState));
      return mongoose;
    }

    await mongoose.connect(mongoUri, options);
    console.log('MongoDB connected to:', mongoUri);
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    // Re-throw so caller can decide what to do
    throw err;
  }

  // Attach event listeners
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection event: connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection event: error', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection event: disconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('SIGINT received: closing MongoDB connection');
    await mongoose.connection.close();
    process.exit(0);
  });

  return mongoose;
}

module.exports = {
  connectToDatabase,
  mapState
};
