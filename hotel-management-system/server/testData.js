require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./src/models/room.model');
const Booking = require('./src/models/booking.model');
const User = require('./src/models/user.model');
const moment = require('moment');

async function createTestData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        // Create a test user
        const testUser = await User.create({
            name: 'Test Admin',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        // Create some test rooms
        const rooms = await Promise.all([
            Room.create({
                userId: testUser._id,
                roomNumber: '101',
                type: 'standard',
                capacity: 2,
                pricePerNight: 2500,
                floor: 1
            }),
            Room.create({
                userId: testUser._id,
                roomNumber: '102',
                type: 'deluxe',
                capacity: 2,
                pricePerNight: 3500,
                floor: 1
            }),
            Room.create({
                userId: testUser._id,
                roomNumber: '201',
                type: 'suite',
                capacity: 4,
                pricePerNight: 5000,
                floor: 2
            })
        ]);

        // Create some test bookings
        const today = moment();
        const bookings = await Promise.all([
            Booking.create({
                room: rooms[0]._id,
                guestName: 'John Doe',
                guestEmail: 'john@example.com',
                guestPhone: '+1234567890',
                checkIn: moment(today).add(2, 'days').toDate(),
                checkOut: moment(today).add(4, 'days').toDate(),
                numberOfGuests: 2,
                status: 'confirmed',
                paymentStatus: 'paid',
                bookingSource: 'website',
                userId: testUser._id
            }),
            Booking.create({
                room: rooms[1]._id,
                guestName: 'Jane Smith',
                guestEmail: 'jane@example.com',
                guestPhone: '+0987654321',
                checkIn: moment(today).add(1, 'days').toDate(),
                checkOut: moment(today).add(3, 'days').toDate(),
                numberOfGuests: 2,
                status: 'pending',
                paymentStatus: 'pending',
                bookingSource: 'website',
                userId: testUser._id
            }),
            Booking.create({
                room: rooms[2]._id,
                guestName: 'Bob Johnson',
                guestEmail: 'bob@example.com',
                guestPhone: '+1122334455',
                checkIn: moment(today).add(3, 'days').toDate(),
                checkOut: moment(today).add(5, 'days').toDate(),
                numberOfGuests: 4,
                status: 'confirmed',
                paymentStatus: 'paid',
                bookingSource: 'website',
                userId: testUser._id
            })
        ]);

        console.log('Test data created successfully!');
        console.log('User created:', testUser._id);
        console.log('Rooms created:', rooms.length);
        console.log('Bookings created:', bookings.length);

        // Close the connection
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error creating test data:', error);
        process.exit(1);
    }
}

createTestData();
