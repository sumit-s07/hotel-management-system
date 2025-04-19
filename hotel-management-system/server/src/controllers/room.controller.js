const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const moment = require('moment');

// Get all rooms with optional filters
exports.getRooms = async (req, res) => {
    try {
        const { type, status, floor } = req.query;
        const query = {};

        if (type) query.type = type;
        if (status) query.status = status;
        if (floor) query.floor = floor;

        // Only show rooms belonging to the signed-in user
        query.userId = req.user._id;

        const rooms = await Room.find(query);
        res.json(rooms);
    } catch (error) {
        console.error('Error getting rooms:', error);
        res.status(500).json({ message: 'Error getting rooms' });
    }
};

// Get a single room by ID
exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (error) {
        console.error('Error getting room:', error);
        res.status(500).json({ message: 'Error getting room' });
    }
};

// Create a new room
exports.createRoom = async (req, res) => {
    try {
        // Add userId from auth middleware
        const roomData = {
            ...req.body,
            userId: req.user._id,
            status: req.body.status || 'available'
        };

        const room = new Room(roomData);
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        console.error('Error creating room:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'Room number already exists' });
        }
        res.status(500).json({ message: 'Error creating room', error: error.message });
    }
};

// Update a room
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ message: 'Error updating room' });
    }
};

// Delete a room
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ message: 'Error deleting room' });
    }
};

// Check room availability for given dates
exports.checkAvailability = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;
        const roomId = req.params.id;

        // Validate dates
        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: 'Check-in and check-out dates are required' });
        }

        // Convert dates to moment objects
        const checkInDate = moment(checkIn);
        const checkOutDate = moment(checkOut);

        // Validate date order
        if (checkInDate.isSameOrAfter(checkOutDate)) {
            return res.status(400).json({ message: 'Check-out date must be after check-in date' });
        }

        // Check for existing bookings in the date range
        const existingBooking = await Booking.findOne({
            room: roomId,
            status: { $ne: 'rejected' }, // Exclude rejected bookings
            $or: [
                {
                    checkIn: { $lt: checkOutDate.toDate() },
                    checkOut: { $gt: checkInDate.toDate() }
                }
            ]
        });

        res.json({ isAvailable: !existingBooking });
    } catch (error) {
        console.error('Error checking room availability:', error);
        res.status(500).json({ message: 'Error checking room availability' });
    }
};
