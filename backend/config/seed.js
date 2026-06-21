require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mekan_db');
    console.log('MongoDB connected');

    const exists = await User.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
    if (exists) {
      console.log('Admin already exists:', exists.username);
      return process.exit(0);
    }

    await User.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      email:    process.env.ADMIN_EMAIL    || 'admin@mekan.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      role: 'superadmin'
    });

    console.log('Admin created!');
    console.log('  Username:', process.env.ADMIN_USERNAME || 'admin');
    console.log('  Password:', process.env.ADMIN_PASSWORD || 'Admin123!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
