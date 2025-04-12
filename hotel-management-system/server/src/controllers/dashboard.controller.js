const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const moment = require('moment');

exports.getDashboardStats = async (req, res) => {
    try {
        // Get room statistics
        const [totalRooms, occupiedRooms] = await Promise.all([
            Room.countDocuments(),
            Room.countDocuments({ status: 'occupied' })
        ]);

        // Get booking statistics
        const [totalBookings, pendingBookings, confirmedBookings] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'confirmed' })
        ]);

        // Get guest statistics
        const [totalGuests, currentGuests] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({ status: 'confirmed', checkOut: { $gt: new Date() } })
        ]);

        // Calculate revenue
        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(moment().startOf('month'))
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]).then(result => result[0]?.total || 0);

        const yearlyRevenue = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(moment().startOf('year'))
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]).then(result => result[0]?.total || 0);

        // Get recent bookings
        const recentBookings = await Booking.find()
            .populate('room')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            stats: {
                totalRooms: totalRooms || 0,
                occupiedRooms: occupiedRooms || 0,
                availableRooms: (totalRooms - occupiedRooms) || 0,
                totalBookings: totalBookings || 0,
                pendingBookings: pendingBookings || 0,
                confirmedBookings: confirmedBookings || 0,
                totalGuests: totalGuests || 0,
                currentGuests: currentGuests || 0,
                monthlyRevenue: monthlyRevenue || 0,
                yearlyRevenue: yearlyRevenue || 0
            },
            recentBookings: recentBookings || []
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Error getting dashboard stats', error: error.message });
    }
};
