const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const { sendBookingConfirmation, sendBookingRejection } = require('../utils/email');
const moment = require('moment');

// Get all bookings with filters
exports.getBookings = async (req, res) => {
    try {
        const { status, startDate, endDate, limit, sort } = req.query;
        const query = {};

        if (status) query.status = status;
        if (startDate && endDate) {
            query.checkIn = { $gte: new Date(startDate) };
            query.checkOut = { $lte: new Date(endDate) };
        }

        const bookings = await Booking.find(query)
            .populate('room')
            .sort(sort ? { createdAt: sort } : { createdAt: -1 })
            .limit(limit ? parseInt(limit) : 10);

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single booking
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('room')
            .populate('verifiedBy', 'name email');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new booking
exports.createBooking = async (req, res) => {
    try {
        const { room, checkIn, checkOut, numberOfGuests } = req.body;
        
        // Validate dates
        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: 'Check-in and check-out dates are required' });
        }

        const checkInDate = moment(checkIn);
        const checkOutDate = moment(checkOut);

        if (checkInDate.isSameOrAfter(checkOutDate)) {
            return res.status(400).json({ message: 'Check-out date must be after check-in date' });
        }

        // Check room availability
        const roomDoc = await Room.findById(room);
        if (!roomDoc) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if room is available for the dates
        const conflictingBookings = await Booking.find({
            room,
            status: { $ne: 'cancelled' },
            $or: [
                {
                    checkIn: { $lte: checkOutDate.toDate() },
                    checkOut: { $gt: checkInDate.toDate() }
                }
            ]
        });

        if (conflictingBookings.length > 0) {
            return res.status(400).json({ message: 'Room is not available for the selected dates' });
        }

        // Check room capacity
        if (numberOfGuests > roomDoc.capacity) {
            return res.status(400).json({ message: 'Number of guests exceeds room capacity' });
        }

        // Calculate total price
        const nights = checkOutDate.diff(checkInDate, 'days');
        const totalPrice = nights * roomDoc.pricePerNight;

        const booking = new Booking({
            ...req.body,
            status: 'pending',
            totalPrice
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

// Verify booking
exports.verifyBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('room');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Update booking status
        booking.status = 'confirmed';
        booking.verifiedBy = req.user._id;
        booking.verificationDate = new Date();
        await booking.save();

        // Send confirmation email
        await sendBookingConfirmation(booking);

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = 'cancelled';
        await booking.save();

        await sendBookingRejection(booking, req.body.reason || 'Booking cancelled by hotel staff');

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
