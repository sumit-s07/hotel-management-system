import axios from 'axios';
import moment from 'moment'; // Import moment library

const API_URL = 'http://localhost:4006/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth services
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/profile');

// Booking services
export const getBookings = (filters = {}) => api.get('/bookings', { params: filters });
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const createBooking = (bookingData) => api.post('/bookings', {
    ...bookingData,
    room: bookingData.roomId, // Convert roomId to room
    checkIn: bookingData.checkIn ? moment(bookingData.checkIn).format('YYYY-MM-DD') : null,
    checkOut: bookingData.checkOut ? moment(bookingData.checkOut).format('YYYY-MM-DD') : null,
    numberOfGuests: parseInt(bookingData.numberOfGuests),
    bookingSource: 'website'
});
export const verifyBooking = (id) => api.post(`/bookings/${id}/verify`);
export const rejectBooking = (id, reason) => api.post(`/bookings/${id}/reject`, { reason });

// Dashboard services
export const getDashboardStats = () => api.get('/dashboard/stats');

// Room services
export const getRooms = (filters = {}) => api.get('/rooms', { params: filters });
export const getRoom = (id) => api.get(`/rooms/${id}`);
export const createRoom = (roomData) => api.post('/rooms', roomData);
export const updateRoom = (id, roomData) => api.put(`/rooms/${id}`, roomData);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);
export const checkRoomAvailability = (id, dates) => api.get(`/rooms/${id}/availability`, { params: dates });

export default api;
