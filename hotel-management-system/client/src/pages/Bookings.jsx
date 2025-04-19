import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  CheckCircle as VerifyIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { getBookings, verifyBooking, rejectBooking, createBooking } from '../services/api';
import toast from 'react-hot-toast';
import BookingDialog from '../components/BookingDialog';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: 'all',
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings(filters);
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const handleOpenDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
  };

  const handleOpenBookingDialog = () => {
    setOpenBookingDialog(true);
  };

  const handleCloseBookingDialog = () => {
    setOpenBookingDialog(false);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerifyBooking = async (bookingId) => {
    try {
      await verifyBooking(bookingId);
      toast.success('Booking verified successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to verify booking');
      console.error('Error verifying booking:', error);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = window.prompt('Please enter a reason for rejection:');
    if (!reason) return;

    try {
      await rejectBooking(bookingId, reason);
      toast.success('Booking rejected successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to reject booking');
      console.error('Error rejecting booking:', error);
    }
  };

  const handleCreateBooking = async (bookingData) => {
    try {
      await createBooking(bookingData);
      toast.success('Booking created successfully');
      handleCloseBookingDialog();
      fetchBookings();
    } catch (error) {
      toast.error('Failed to create booking');
      console.error('Error creating booking:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const searchMatch = 
      booking.guestName.toLowerCase().includes(filters.search.toLowerCase()) ||
      booking.roomNumber.toLowerCase().includes(filters.search.toLowerCase());
    const statusMatch = !filters.status || booking.status === filters.status;
    
    let dateMatch = true;
    const today = moment();
    const checkIn = moment(booking.checkIn);
    
    switch (filters.dateRange) {
      case 'today':
        dateMatch = checkIn.isSame(today, 'day');
        break;
      case 'week':
        dateMatch = checkIn.isBetween(today, moment().add(7, 'days'), 'day', '[]');
        break;
      case 'month':
        dateMatch = checkIn.isBetween(today, moment().add(30, 'days'), 'day', '[]');
        break;
      default:
        dateMatch = true;
    }

    return searchMatch && statusMatch && dateMatch;
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Bookings</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleOpenBookingDialog}
        >
          New Booking
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            InputProps={{
              endAdornment: <SearchIcon />
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Date Range</InputLabel>
            <Select
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              label="Date Range"
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Next 7 Days</MenuItem>
              <MenuItem value="month">Next 30 Days</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Guest Name</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8}>Loading bookings...</TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>No bookings found matching the filters.</TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>#{booking._id.slice(-6)}</TableCell>
                  <TableCell>{booking.guestName}</TableCell>
                  <TableCell>{booking.room?.roomNumber || '-'}</TableCell>
                  <TableCell>{moment(booking.checkIn).format('MMM D, YYYY')}</TableCell>
                  <TableCell>{moment(booking.checkOut).format('MMM D, YYYY')}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>₹{booking.totalPrice}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(booking)}
                      title="View Details"
                    >
                      <ViewIcon />
                    </IconButton>
                    {booking.status === 'pending' && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          title="Verify"
                          onClick={() => handleVerifyBooking(booking._id)}
                        >
                          <VerifyIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          title="Reject"
                          onClick={() => handleRejectBooking(booking._id)}
                        >
                          <RejectIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>Booking Details #{selectedBooking._id.slice(-6)}</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Guest Information
                </Typography>
                <Typography>Name: {selectedBooking.guestName}</Typography>
                <Typography>Email: {selectedBooking.guestEmail}</Typography>
                <Typography>Phone: {selectedBooking.guestPhone}</Typography>

                <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                  Booking Details
                </Typography>
                <Typography>Room: {selectedBooking.room?.roomNumber || '-'} ({selectedBooking.room?.type || '-'})</Typography>
                <Typography>Check-in: {moment(selectedBooking.checkIn).format('MMMM D, YYYY')}</Typography>
                <Typography>Check-out: {moment(selectedBooking.checkOut).format('MMMM D, YYYY')}</Typography>
                <Typography>Guests: {selectedBooking.numberOfGuests}</Typography>
                <Typography>Total Amount: ₹{selectedBooking.totalPrice}</Typography>
                <Typography>Status: {selectedBooking.status}</Typography>
                <Typography>Booked on: {moment(selectedBooking.createdAt).format('MMMM D, YYYY HH:mm')}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              {selectedBooking.status === 'pending' && (
                <>
                  <Button
                    color="success"
                    variant="contained"
                    onClick={() => {
                      handleVerifyBooking(selectedBooking._id);
                      handleCloseDialog();
                    }}
                  >
                    Verify Booking
                  </Button>
                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => {
                      handleRejectBooking(selectedBooking._id);
                      handleCloseDialog();
                    }}
                  >
                    Reject Booking
                  </Button>
                </>
              )}
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <BookingDialog
        open={openBookingDialog}
        onClose={handleCloseBookingDialog}
        onSubmit={handleCreateBooking}
      />
    </Box>
  );
}
