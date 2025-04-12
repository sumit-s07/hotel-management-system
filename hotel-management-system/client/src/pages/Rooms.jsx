import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as AvailableIcon,
  Cancel as OccupiedIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { getRooms, deleteRoom, createRoom, updateRoom } from '../services/api';
import toast from 'react-hot-toast';
import RoomDialog from '../components/RoomDialog';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    floor: '',
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await getRooms(filters);
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const handleOpenDialog = (room) => {
    setSelectedRoom(room);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRoom(null);
  };

  const handleOpenRoomDialog = (room = null) => {
    setEditingRoom(room);
    setOpenRoomDialog(true);
  };

  const handleCloseRoomDialog = () => {
    setOpenRoomDialog(false);
    setEditingRoom(null);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await deleteRoom(roomId);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      toast.error('Failed to delete room');
      console.error('Error deleting room:', error);
    }
  };

  const handleRoomSubmit = async (roomData) => {
    try {
      if (editingRoom) {
        await updateRoom(editingRoom._id, roomData);
        toast.success('Room updated successfully');
      } else {
        await createRoom(roomData);
        toast.success('Room created successfully');
      }
      handleCloseRoomDialog();
      fetchRooms();
    } catch (error) {
      toast.error(editingRoom ? 'Failed to update room' : 'Failed to create room');
      console.error('Error saving room:', error);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const searchMatch = room.roomNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
                       room.type.toLowerCase().includes(filters.search.toLowerCase());
    const typeMatch = !filters.type || room.type === filters.type;
    const statusMatch = !filters.status || room.status === filters.status;
    const floorMatch = !filters.floor || room.floor.toString() === filters.floor;
    return searchMatch && typeMatch && statusMatch && floorMatch;
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Rooms</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleOpenRoomDialog()}
        >
          Add New Room
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
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
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Room Type</InputLabel>
            <Select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              label="Room Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Deluxe">Deluxe</MenuItem>
              <MenuItem value="Suite">Suite</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="occupied">Occupied</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Floor</InputLabel>
            <Select
              name="floor"
              value={filters.floor}
              onChange={handleFilterChange}
              label="Floor"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="1">1st Floor</MenuItem>
              <MenuItem value="2">2nd Floor</MenuItem>
              <MenuItem value="3">3rd Floor</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Typography>Loading rooms...</Typography>
          </Grid>
        ) : filteredRooms.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No rooms found matching the filters.</Typography>
          </Grid>
        ) : (
          filteredRooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">Room {room.roomNumber}</Typography>
                    <Chip
                      icon={room.status === 'available' ? <AvailableIcon /> : <OccupiedIcon />}
                      label={room.status}
                      color={room.status === 'available' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {room.type} - Floor {room.floor}
                  </Typography>
                  <Typography variant="body2" component="p">
                    Capacity: {room.capacity} persons
                  </Typography>
                  <Typography variant="body2" component="p">
                    Price: ₹{room.pricePerNight}/night
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {room.amenities.map((amenity, index) => (
                      <Chip
                        key={index}
                        label={amenity}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleOpenDialog(room)}>
                    View Details
                  </Button>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleOpenRoomDialog(room)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteRoom(room._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedRoom && (
          <>
            <DialogTitle>Room {selectedRoom.roomNumber} Details</DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                {selectedRoom.type} Room
              </Typography>
              <Typography gutterBottom>Floor: {selectedRoom.floor}</Typography>
              <Typography gutterBottom>
                Capacity: {selectedRoom.capacity} persons
              </Typography>
              <Typography gutterBottom>
                Price per night: ₹{selectedRoom.pricePerNight}
              </Typography>
              <Typography gutterBottom>Status: {selectedRoom.status}</Typography>
              <Typography gutterBottom>Amenities:</Typography>
              <Box sx={{ mt: 1 }}>
                {selectedRoom.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    label={amenity}
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <RoomDialog
        open={openRoomDialog}
        onClose={handleCloseRoomDialog}
        onSubmit={handleRoomSubmit}
        initialData={editingRoom}
      />
    </Box>
  );
}
