const mongoose = require('mongoose');

const TEST_DB_NAME = 'afrolatam_connect_test';
const TEST_MONGODB_URI = `mongodb://127.0.0.1:27017/${TEST_DB_NAME}`;

let isConnected = false;

const connectTestDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  
  await mongoose.connect(TEST_MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    appName: 'afrolatam-test',
  });
  isConnected = true;
};

const disconnectTestDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
};

const clearTestDB = async () => {
  if (!isConnected) return;
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  TEST_MONGODB_URI,
  TEST_DB_NAME,
};