const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolvers as fallback for reliable SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Direct replica set URI that does not require DNS SRV lookup (immune to router/ISP SRV blocking)
const DIRECT_MONGODB_URI =
  'mongodb://gouthamivalivarthi_db_user:8ozQKXbosgcVud30@ac-t0opm9p-shard-00-00.midmq3i.mongodb.net:27017,ac-t0opm9p-shard-00-01.midmq3i.mongodb.net:27017,ac-t0opm9p-shard-00-02.midmq3i.mongodb.net:27017/project_collab?ssl=true&replicaSet=atlas-icbabk-shard-0&authSource=admin&retryWrites=true&w=majority';

const DEFAULT_MONGODB_URI = DIRECT_MONGODB_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, return active connection
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  // If currently connecting, return ongoing promise
  if (cached.promise && mongoose.connection && mongoose.connection.readyState === 2) {
    return cached.promise;
  }

  const primaryUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  const opts = {
    autoIndex: true,
    serverSelectionTimeoutMS: 25000,
    connectTimeoutMS: 25000,
    socketTimeoutMS: 45000,
  };

  const attemptConnect = async (targetUri, isRetry = false) => {
    try {
      const conn = await mongoose.connect(targetUri, opts);
      console.log(`MongoDB connected successfully to host: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      // If primary was an SRV URI and failed with DNS or connection issues, automatically retry with direct replica set URI
      if (!isRetry && targetUri.includes('+srv') && targetUri !== DIRECT_MONGODB_URI) {
        console.warn(`SRV connection failed (${err.message}). Retrying with direct replica set URI...`);
        return attemptConnect(DIRECT_MONGODB_URI, true);
      }
      throw err;
    }
  };

  cached.promise = attemptConnect(primaryUri)
    .then((mongooseInstance) => {
      cached.conn = mongooseInstance;
      return mongooseInstance;
    })
    .catch((err) => {
      cached.promise = null;
      cached.conn = null;
      console.error(`MongoDB connection error: ${err.message}`);
      throw err;
    });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
