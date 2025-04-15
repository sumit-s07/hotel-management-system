import api from './api';

export const getDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error.response?.data || error.message);
        throw error;
    }
};

export const getRecentBookings = async () => {
    try {
        const response = await api.get('/bookings', {
            params: {
                limit: 10,
                sort: '-1'  // Sort by createdAt in descending order
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching recent bookings:', error.response?.data || error.message);
        throw error;
    }
};
