require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const fixPasswords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hash the correct password
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Update all users to have the correct password hash
    const result = await User.updateMany(
      {}, // Update all users
      { passwordHash }
    );
    
    console.log(`Updated ${result.modifiedCount} users with correct password hash`);
    console.log('All users now have password: password123');

  } catch (error) {
    console.error('Error fixing passwords:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixPasswords();