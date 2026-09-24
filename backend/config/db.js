const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolvers to ensure robust SRV lookup on all networks and OS platforms
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // If setting DNS servers fails or is restricted, continue with default
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
