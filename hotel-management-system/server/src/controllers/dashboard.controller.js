const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const moment = require('moment');

exports.getDashboardStats = async (req, res) => {
    try {
        console.log('Fetching dashboard stats...');
        
        // Get room statistics
        const [totalRooms, occupiedRooms] = await Promise.all([
            Room.countDocuments().then(count => {
                console.log('Total rooms:', count);
                return count;
            }),
            Room.countDocuments({ status: 'occupied' }).then(count => {
                console.log('Occupied rooms:', count);
                return count;
            })
        ]);

        // Get booking statistics
        const [totalBookings, pendingBookings, confirmedBookings] = await Promise.all([
            Booking.countDocuments().then(count => {
                console.log('Total bookings:', count);
                return count;
            }),
            Booking.countDocuments({ status: 'pending' }).then(count => {
                console.log('Pending bookings:', count);
                return count;
            }),
            Booking.countDocuments({ status: 'confirmed' }).then(count => {
                console.log('Confirmed bookings:', count);
                return count;
            })
        ]);

        // Get guest statistics
        const [totalGuests, currentGuests] = await Promise.all([
            Booking.countDocuments().then(count => {
                console.log('Total guests:', count);
                return count;
            }),
            Booking.countDocuments({ 
                status: 'confirmed', 
                checkOut: { $gt: new Date() }
            }).then(count => {
                console.log('Current guests:', count);
                return count;
            })
        ]);

        // Calculate revenue
        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(moment().startOf('month'))
                    },
                    status: 'confirmed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]).then(result => {
            console.log('Monthly revenue:', result[0]?.total || 0);
            return result[0]?.total || 0;
        });

        const yearlyRevenue = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(moment().startOf('year'))
                    },
                    status: 'confirmed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]).then(result => {
            console.log('Yearly revenue:', result[0]?.total || 0);
            return result[0]?.total || 0;
        });

        // Get recent bookings
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('room', 'roomNumber type pricePerNight')
            .populate('userId', 'name')
            .then(bookings => {
                console.log('Recent bookings fetched:', bookings.length);
                return bookings;
            });

        res.json({
            totalRooms,
            occupiedRooms,
            availableRooms: totalRooms - occupiedRooms,
            totalBookings,
            pendingBookings,
            confirmedBookings,
            totalGuests,
            currentGuests,
            monthlyRevenue,
            yearlyRevenue,
            recentBookings
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Return a more detailed error response
        res.status(500).json({ 
            message: 'Error getting dashboard stats',
            error: {
                name: error.name,
                message: error.message
            }
        });
    }
};
