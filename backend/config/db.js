const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolvers for reliable SRV lookup on all networks & serverless platforms
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const DEFAULT_MONGODB_URI =
  'mongodb+srv://gouthamivalivarthi_db_user:8ozQKXbosgcVud30@cluster0.midmq3i.mongodb.net/project_collab?retryWrites=true&w=majority&appName=Cluster0';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log(`MongoDB connected successfully: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error(`MongoDB connection error: ${err.message}`);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
