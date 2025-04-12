const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth.middleware');
const bookingController = require('../controllers/booking.controller');
const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const { authenticate } = require('../middleware/auth');

// Get all bookings (staff and managers only)
router.get('/', 
    auth, 
    authorize('staff', 'manager', 'admin'), 
    bookingController.getBookings
);

// Get single booking
router.get('/:id', 
    auth, 
    authorize('staff', 'manager', 'admin'), 
    bookingController.getBooking
);

// Verify booking
router.post('/:id/verify', 
    auth, 
    authorize('staff', 'manager', 'admin'), 
    bookingController.verifyBooking
);

// Cancel booking
router.post('/:id/cancel', 
    auth, 
    authorize('staff', 'manager', 'admin'), 
    bookingController.cancelBooking
);

// Create new booking
router.post('/', 
    auth, 
    authorize('customer', 'staff', 'manager', 'admin'), 
    bookingController.createBooking
);

// Get all bookings for current user
router.get('/my-bookings', authenticate, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('room')
            .populate('verifiedBy', 'name');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all rooms managed by current user
router.get('/my-rooms', authenticate, async (req, res) => {
    try {
        // Get all rooms that have bookings created by this user
        const rooms = await Room.find({
            _id: {
                $in: await Booking.distinct('room', { userId: req.user._id })
            }
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new booking (with user ID)
router.post('/book', authenticate, async (req, res) => {
    try {
        const booking = new Booking({
            ...req.body,
            userId: req.user._id
        });
        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
