require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const adminData = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create new admin user
        const admin = new User(adminData);
        await admin.save();
        console.log('Admin user created successfully');
        console.log('Credentials:');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();
