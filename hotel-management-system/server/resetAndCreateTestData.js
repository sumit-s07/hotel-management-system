require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./src/models/room.model');
const Booking = require('./src/models/booking.model');
const User = require('./src/models/user.model');
const moment = require('moment');

async function resetAndCreateTestData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        // Clear existing data
        await Promise.all([
            Room.deleteMany({}),
            Booking.deleteMany({}),
            User.deleteMany({})
        ]);

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
            createBooking(rooms[0], testUser, 'John Doe', 'john@example.com', '+1234567890', 2, 2),
            createBooking(rooms[1], testUser, 'Jane Smith', 'jane@example.com', '+0987654321', 1, 2),
            createBooking(rooms[2], testUser, 'Bob Johnson', 'bob@example.com', '+1122334455', 3, 4)
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

async function createBooking(room, user, guestName, guestEmail, guestPhone, daysOffset, nights) {
    const checkIn = moment().add(daysOffset, 'days').toDate();
    const checkOut = moment(checkIn).add(nights, 'days').toDate();
    const totalPrice = nights * room.pricePerNight;

    return Booking.create({
        room: room._id,
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        numberOfGuests: room.capacity,
        totalPrice,
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingSource: 'website',
        userId: user._id
    });
}

resetAndCreateTestData();
