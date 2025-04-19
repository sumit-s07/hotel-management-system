const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['standard', 'deluxe', 'suite', 'Standard', 'Deluxe', 'Suite']
    },
    capacity: {
        type: Number,
        required: true
    },
    pricePerNight: {
        type: Number,
        required: true
    },
    amenities: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    },
    floor: {
        type: Number,
        required: true
    }
});

// Middleware to convert type to lowercase before saving
roomSchema.pre('save', function(next) {
    if (this.type) {
        this.type = this.type.toLowerCase();
    }
    next();
});

// Create a compound unique index on (roomNumber, userId)
roomSchema.index({ roomNumber: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
