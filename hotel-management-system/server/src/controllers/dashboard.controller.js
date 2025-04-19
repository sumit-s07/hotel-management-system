const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const moment = require('moment');

exports.getDashboardStats = async (req, res) => {
    try {
        console.log('Fetching dashboard stats...');
        
        // Only show data for the signed-in user
        const userId = req.user._id;

        // Get room statistics for this user
        const [totalRooms, occupiedRooms] = await Promise.all([
            Room.countDocuments({ userId }).then(count => {
                console.log('Total rooms (user):', count);
                return count;
            }),
            Room.countDocuments({ userId, status: 'occupied' }).then(count => {
                console.log('Occupied rooms (user):', count);
                return count;
            })
        ]);

        // Get booking statistics for this user
        const [totalBookings, pendingBookings, confirmedBookings] = await Promise.all([
            Booking.countDocuments({ userId }).then(count => {
                console.log('Total bookings (user):', count);
                return count;
            }),
            Booking.countDocuments({ userId, status: 'pending' }).then(count => {
                console.log('Pending bookings (user):', count);
                return count;
            }),
            Booking.countDocuments({ userId, status: 'confirmed' }).then(count => {
                console.log('Confirmed bookings (user):', count);
                return count;
            })
        ]);

        // Get guest statistics for this user (sum numberOfGuests)
        const [totalGuests, currentGuests] = await Promise.all([
            Booking.aggregate([
                { $match: { userId } },
                { $group: { _id: null, total: { $sum: '$numberOfGuests' } } }
            ]).then(result => {
                const total = result[0]?.total || 0;
                console.log('Total guests (user):', total);
                return total;
            }),
            Booking.aggregate([
                { $match: {
                    userId,
                    status: 'confirmed',
                    checkIn: { $lte: new Date() },
                    checkOut: { $gt: new Date() }
                }},
                { $group: { _id: null, total: { $sum: '$numberOfGuests' } } }
            ]).then(result => {
                const total = result[0]?.total || 0;
                console.log('Current guests (user):', total);
                return total;
            })
        ]);

        // Calculate revenue for this user
        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { userId: userId },
                                { userId: typeof userId === 'object' && userId.toString ? userId.toString() : userId }
                            ]
                        },
                        { createdAt: { $gte: new Date(moment().startOf('month')) } },
                        { status: 'confirmed' }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]).then(result => {
            console.log('Monthly revenue (user):', result[0]?.total || 0);
            return result[0]?.total || 0;
        });

        const yearlyRevenue = await Booking.aggregate([
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { userId: userId },
                                { userId: typeof userId === 'object' && userId.toString ? userId.toString() : userId }
                            ]
                        },
                        { createdAt: { $gte: new Date(moment().startOf('year')) } },
                        { status: 'confirmed' }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]).then(result => {
            console.log('Yearly revenue (user):', result[0]?.total || 0);
            return result[0]?.total || 0;
        });

        // Get recent bookings for this user
        const recentBookings = await Booking.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('room', 'roomNumber type pricePerNight')
            .populate('userId', 'name')
            .then(bookings => {
                console.log('Recent bookings fetched (user):', bookings.length);
                return bookings;
            });

        // availableRooms is now calculated per user
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
