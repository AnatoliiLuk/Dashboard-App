const path = require('node:path');

const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../../../../.env'),
});

const configured = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

if (!configured) {
  throw new Error('Set DATABASE_URL before running API integration tests');
}

const url = new URL(configured);
url.pathname = '/habit_tracker_test';
process.env.DATABASE_URL = url.toString();
process.env.NODE_ENV = 'test';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = 'integration-test-jwt-secret-32chars';
}
