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
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useState } from 'react';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite'];
const AVAILABLE_AMENITIES = [
  'AC',
  'TV',
  'WiFi',
  'Mini Bar',
  'Jacuzzi',
  'Kitchen',
  'Balcony',
  'Sea View',
  'Mountain View',
  'Room Service'
];

export default function RoomDialog({ open, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState(
    initialData || {
      roomNumber: '',
      type: '',
      floor: '',
      capacity: '',
      pricePerNight: '',
      status: 'available',
      amenities: [],
    }
  );
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomNumber) newErrors.roomNumber = 'Room number is required';
    if (!formData.type) newErrors.type = 'Room type is required';
    if (!formData.floor) newErrors.floor = 'Floor number is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    if (!formData.pricePerNight) newErrors.pricePerNight = 'Price is required';
    if (formData.amenities.length === 0) newErrors.amenities = 'At least one amenity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        floor: parseInt(formData.floor),
        capacity: parseInt(formData.capacity),
        pricePerNight: parseFloat(formData.pricePerNight)
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Room' : 'Add New Room'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Room Number"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              error={!!errors.roomNumber}
              helperText={errors.roomNumber}
              required
            />

            <FormControl error={!!errors.type} required>
              <InputLabel>Room Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Room Type"
              >
                {ROOM_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Floor"
              name="floor"
              type="number"
              value={formData.floor}
              onChange={handleChange}
              error={!!errors.floor}
              helperText={errors.floor}
              required
            />

            <TextField
              label="Capacity (persons)"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              error={!!errors.capacity}
              helperText={errors.capacity}
              required
            />

            <TextField
              label="Price per Night (₹)"
              name="pricePerNight"
              type="number"
              value={formData.pricePerNight}
              onChange={handleChange}
              error={!!errors.pricePerNight}
              helperText={errors.pricePerNight}
              required
            />

            <FormControl error={!!errors.amenities}>
              <Typography variant="subtitle2" gutterBottom>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {AVAILABLE_AMENITIES.map(amenity => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    color={formData.amenities.includes(amenity) ? 'primary' : 'default'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
              {errors.amenities && (
                <Typography color="error" variant="caption">
                  {errors.amenities}
                </Typography>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Update Room' : 'Add Room'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
