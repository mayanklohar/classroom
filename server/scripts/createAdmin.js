require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@demo.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create admin user
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@demo.com',
      passwordHash,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@demo.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();