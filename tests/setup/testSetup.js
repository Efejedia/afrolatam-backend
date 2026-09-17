const mongoose = require('mongoose');

jest.mock('../../src/config/cloudinary', () => {
  const multer = require('multer');
  const memoryStorage = multer.memoryStorage();
  const mockUpload = multer({ storage: memoryStorage });
  
  return {
    cloudinary: {
      v2: {
        uploader: {
          upload: jest.fn().mockResolvedValue({
            secure_url: 'https://mock-cloudinary.com/test-image.jpg',
            public_id: 'test-image-id',
          }),
          destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
        },
        config: jest.fn(),
      },
    },
    upload: mockUpload,
  };
});

const TEST_DB_NAME = 'afrolatam_connect_test';
const TEST_MONGODB_URI = `mongodb://127.0.0.1:27017/${TEST_DB_NAME}`;

beforeAll(() => {
  process.env.MONGODB_URI = TEST_MONGODB_URI;
  process.env.SERVER_URL = 'http://localhost:5000';
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
  process.env.CLOUDINARY_API_KEY = 'test-key';
  process.env.CLOUDINARY_API_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
  
  console.log(`Test environment configured for database: ${TEST_DB_NAME}`);
});