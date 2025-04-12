const express = require('express');
const router = express.Router();
const Room = require('../models/room.model');
const { authenticate } = require('../middleware/auth');

// Get all rooms
router.get('/', authenticate, async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single room
router.get('/:id', authenticate, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create room (admin only)
router.post('/', authenticate, async (req, res) => {
    try {
        const room = new Room({
            ...req.body,
            userId: req.user._id
        });
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        console.error('Room creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update room (admin only)
router.put('/:id', authenticate, async (req, res) => {
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
        res.status(400).json({ message: error.message });
    }
});

// Check room availability
router.get('/:id/availability', authenticate, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if the room is available for the given dates
        const booking = await Booking.findOne({
            room: room._id,
            status: 'confirmed',
            $or: [
                {
                    checkIn: { $lte: new Date(startDate) },
                    checkOut: { $gte: new Date(startDate) }
                },
                {
                    checkIn: { $lte: new Date(endDate) },
                    checkOut: { $gte: new Date(endDate) }
                }
            ]
        });

        res.json({ available: !booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
