import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getProfile } from '../services/api';
import * as jwt from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const response = await getProfile();
            setUser(response.data);
        } catch (error) {
            console.error('Error loading user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await apiLogin(credentials);
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const decoded = jwt.jwtDecode(token);
            return decoded.exp > Date.now() / 1000;
        } catch (error) {
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
