import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const HotelContext = createContext();

export const useHotel = () => useContext(HotelContext);

export const HotelProvider = ({ children }) => {
  const [hotelName, setHotelName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setHotelName(response.data.hotelName || '');
      } catch (err) {
        setHotelName('');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <HotelContext.Provider value={{ hotelName, loading }}>
      {children}
    </HotelContext.Provider>
  );
};
