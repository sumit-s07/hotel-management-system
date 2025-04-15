const mongoose = require('mongoose');
const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const moment = require('moment');

async function createTestBooking() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        // Create some test rooms
        const rooms = await Promise.all([
            Room.create({
                roomNumber: '101',
                type: 'standard',
                capacity: 2,
                pricePerNight: 2500,
                floor: 1
            }),
            Room.create({
                roomNumber: '102',
                type: 'deluxe',
                capacity: 2,
                pricePerNight: 3500,
                floor: 1
            }),
            Room.create({
                roomNumber: '103',
                type: 'suite',
                capacity: 4,
                pricePerNight: 5000,
                floor: 2
            })
        ]);

        // Create some test bookings
        const bookings = await Promise.all([
            Booking.create({
                room: rooms[0]._id,
                guestName: 'John Doe',
                guestEmail: 'john@example.com',
                guestPhone: '+1234567890',
                checkIn: moment().add(1, 'days').toDate(),
                checkOut: moment().add(3, 'days').toDate(),
                numberOfGuests: 2,
                totalPrice: 7500,
                status: 'confirmed',
                paymentStatus: 'paid',
                bookingSource: 'website',
                userId: '65a123456789012345678901'
            }),
            Booking.create({
                room: rooms[1]._id,
                guestName: 'Jane Smith',
                guestEmail: 'jane@example.com',
                guestPhone: '+0987654321',
                checkIn: moment().add(2, 'days').toDate(),
                checkOut: moment().add(4, 'days').toDate(),
                numberOfGuests: 2,
                totalPrice: 10500,
                status: 'pending',
                paymentStatus: 'pending',
                bookingSource: 'website',
                userId: '65a123456789012345678901'
            }),
            Booking.create({
                room: rooms[2]._id,
                guestName: 'Bob Johnson',
                guestEmail: 'bob@example.com',
                guestPhone: '+1122334455',
                checkIn: moment().add(3, 'days').toDate(),
                checkOut: moment().add(5, 'days').toDate(),
                numberOfGuests: 4,
                totalPrice: 20000,
                status: 'confirmed',
                paymentStatus: 'paid',
                bookingSource: 'website',
                userId: '65a123456789012345678901'
            })
        ]);

        console.log('Test data created successfully!');
        console.log('Rooms created:', rooms.length);
        console.log('Bookings created:', bookings.length);

        // Close the connection
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error creating test data:', error);
        process.exit(1);
    }
}

createTestBooking();
