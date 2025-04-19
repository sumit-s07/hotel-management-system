import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import {
  Hotel as HotelIcon,
  Person as PersonIcon,
  BookOnline as BookingIcon,
  MonetizationOn as RevenueIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { getDashboardStats, getRecentBookings } from '../services/dashboard.api';
import moment from 'moment';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      bgcolor: color,
      color: 'white',
    }}
  >
    <Box sx={{ mr: 2 }}>{icon}</Box>
    <Box>
      <Typography variant="h6" component="div">
        {value}
      </Typography>
      <Typography variant="body2">{title}</Typography>
    </Box>
  </Paper>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard data...');
        const [statsData, bookings] = await Promise.all([
          getDashboardStats(),
          getRecentBookings()
        ]);
        console.log('Received stats data:', statsData);
        console.log('Received bookings:', bookings);
        setStats(statsData);
        setRecentBookings(bookings);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant="h6">No data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Room Statistics */}
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms || 0}
            icon={<HotelIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Occupied Rooms"
            value={stats.occupiedRooms || 0}
            icon={<HotelIcon />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Available Rooms"
            value={stats.availableRooms || 0}
            icon={<HotelIcon />}
            color="#64b5f6"
          />
        </Grid>

        {/* Booking Statistics */}
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings || 0}
            icon={<BookingIcon />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Pending Bookings"
            value={stats.pendingBookings || 0}
            icon={<BookingIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Confirmed Bookings"
            value={stats.confirmedBookings || 0}
            icon={<BookingIcon />}
            color="#81c784"
          />
        </Grid>

        {/* Guest Statistics */}
        <Grid item xs={12} md={6}>
          <StatCard
            title="Total Guests"
            value={stats.totalGuests || 0}
            icon={<PersonIcon />}
            color="#7b1fa2"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard
            title="Current Guests"
            value={stats.currentGuests || 0}
            icon={<PersonIcon />}
            color="#9c27b0"
          />
        </Grid>

        {/* Revenue Statistics */}
        <Grid item xs={12} md={6}>
          <StatCard
            title="Monthly Revenue"
            value={`₹${stats.monthlyRevenue || 0}`}
            icon={<RevenueIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard
            title="Yearly Revenue"
            value={`₹${stats.yearlyRevenue || 0}`}
            icon={<RevenueIcon />}
            color="#ffb300"
          />
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            <Grid container spacing={2}>
              {recentBookings.map((booking) => (
                <Grid item xs={12} key={booking._id}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: booking.status === 'confirmed' ? '#e8f5e9' : '#fff3e0',
                    }}
                  >
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle1">{booking.guestName}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2">
                          Room: {booking.room ? booking.room.roomNumber : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2">
                          Check-in: {moment(booking.checkIn).format('YYYY-MM-DD')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2">
                          Check-out: {moment(booking.checkOut).format('YYYY-MM-DD')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: booking.status === 'confirmed' ? 'success.main' : 'warning.main',
                            textTransform: 'capitalize',
                          }}
                        >
                          {booking.status}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
