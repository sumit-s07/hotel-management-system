import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { getRooms, checkRoomAvailability } from '../services/api';

export default function BookingDialog({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomId: '',
    checkIn: null,
    checkOut: null,
    numberOfGuests: '',
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = async (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));

    // Clear room selection when dates change
    if (formData.roomId) {
      setFormData(prev => ({ ...prev, roomId: '' }));
    }

    // Check room availability when both dates are selected
    if (name === 'checkOut' && formData.checkIn || name === 'checkIn' && formData.checkOut) {
      try {
        setLoading(true);
        const checkIn = name === 'checkIn' ? date : formData.checkIn;
        const checkOut = name === 'checkOut' ? date : formData.checkOut;
        
        const availableRoomsResponse = await Promise.all(
          rooms.map(async room => {
            const availability = await checkRoomAvailability(room._id, {
              checkIn: moment(checkIn).format('YYYY-MM-DD'),
              checkOut: moment(checkOut).format('YYYY-MM-DD')
            });
            return availability.data.isAvailable ? room : null;
          })
        );
        
        setAvailableRooms(availableRoomsResponse.filter(room => room !== null));
      } catch (error) {
        console.error('Error checking room availability:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.guestName) newErrors.guestName = 'Guest name is required';
    if (!formData.guestEmail) newErrors.guestEmail = 'Email is required';
    else if (!emailRegex.test(formData.guestEmail)) newErrors.guestEmail = 'Invalid email format';
    
    if (!formData.guestPhone) newErrors.guestPhone = 'Phone number is required';
    else if (!phoneRegex.test(formData.guestPhone)) newErrors.guestPhone = 'Invalid phone number format';
    
    if (!formData.roomId) newErrors.roomId = 'Room selection is required';
    if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!formData.checkOut) newErrors.checkOut = 'Check-out date is required';
    if (!formData.numberOfGuests) newErrors.numberOfGuests = 'Number of guests is required';
    
    if (formData.checkIn && formData.checkOut && moment(formData.checkIn).isSameOrAfter(formData.checkOut)) {
      newErrors.checkOut = 'Check-out date must be after check-in date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const selectedRoom = rooms.find(room => room._id === formData.roomId);
      const totalNights = moment(formData.checkOut).diff(moment(formData.checkIn), 'days');
      const bookingData = {
        ...formData,
        checkIn: moment(formData.checkIn).format('YYYY-MM-DD'),
        checkOut: moment(formData.checkOut).format('YYYY-MM-DD'),
        numberOfGuests: parseInt(formData.numberOfGuests),
        roomNumber: selectedRoom.roomNumber,
        roomType: selectedRoom.type,
        totalPrice: selectedRoom.pricePerNight * totalNights
      };
      onSubmit(bookingData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Booking</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Guest Name"
              name="guestName"
              value={formData.guestName}
              onChange={handleChange}
              error={!!errors.guestName}
              helperText={errors.guestName}
              required
            />

            <TextField
              label="Email"
              name="guestEmail"
              type="email"
              value={formData.guestEmail}
              onChange={handleChange}
              error={!!errors.guestEmail}
              helperText={errors.guestEmail}
              required
            />

            <TextField
              label="Phone Number"
              name="guestPhone"
              value={formData.guestPhone}
              onChange={handleChange}
              error={!!errors.guestPhone}
              helperText={errors.guestPhone}
              required
            />

            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Check-in Date"
                  value={formData.checkIn}
                  onChange={(date) => handleDateChange('checkIn', date)}
                  minDate={moment()}
                  slotProps={{
                    textField: {
                      error: !!errors.checkIn,
                      helperText: errors.checkIn,
                      required: true,
                      fullWidth: true,
                    }
                  }}
                />
                <DatePicker
                  label="Check-out Date"
                  value={formData.checkOut}
                  onChange={(date) => handleDateChange('checkOut', date)}
                  minDate={formData.checkIn ? moment(formData.checkIn).add(1, 'day') : moment().add(1, 'day')}
                  slotProps={{
                    textField: {
                      error: !!errors.checkOut,
                      helperText: errors.checkOut,
                      required: true,
                      fullWidth: true,
                    }
                  }}
                />
              </Box>
            </LocalizationProvider>

            <FormControl error={!!errors.roomId} required>
              <InputLabel>Select Room</InputLabel>
              <Select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                label="Select Room"
                disabled={!formData.checkIn || !formData.checkOut || loading}
              >
                {loading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} /> Checking availability...
                  </MenuItem>
                ) : availableRooms.length > 0 ? (
                  availableRooms.map(room => (
                    <MenuItem key={room._id} value={room._id}>
                      Room {room.roomNumber} - {room.type} (₹{room.pricePerNight}/night)
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {formData.checkIn && formData.checkOut
                      ? 'No rooms available for selected dates'
                      : 'Select dates to see available rooms'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              label="Number of Guests"
              name="numberOfGuests"
              type="number"
              value={formData.numberOfGuests}
              onChange={handleChange}
              error={!!errors.numberOfGuests}
              helperText={errors.numberOfGuests}
              required
              inputProps={{ min: 1 }}
            />

            {formData.roomId && formData.checkIn && formData.checkOut && (
              <Typography variant="body2" color="text.secondary">
                Total Price: ₹
                {(rooms.find(room => room._id === formData.roomId)?.pricePerNight || 0) *
                  moment(formData.checkOut).diff(moment(formData.checkIn), 'days')}
                {' '}
                for {moment(formData.checkOut).diff(moment(formData.checkIn), 'days')} nights
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Create Booking
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
