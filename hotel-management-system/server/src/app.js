const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const roomRoutes = require('./routes/room.route');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Hotel Management System API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            bookings: '/api/bookings',
            rooms: '/api/rooms',
            dashboard: '/api/dashboard'
        }
    });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 4005;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
