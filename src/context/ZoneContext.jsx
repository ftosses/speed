import React, { createContext, useState, useContext, useEffect } from 'react';
import { ZONES } from '../utils/constants';

const ZoneContext = createContext();

export const useZone = () => {
  const context = useContext(ZoneContext);
  if (!context) {
    throw new Error('useZone must be used within a ZoneProvider');
  }
  return context;
};

export const ZoneProvider = ({ children }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load zone from localStorage on mount
  useEffect(() => {
    const savedZone = localStorage.getItem('speed_zone');
    if (savedZone) {
      try {
        setSelectedZone(JSON.parse(savedZone));
      } catch (error) {
        console.error('Error parsing saved zone:', error);
        localStorage.removeItem('speed_zone');
      }
    }
    setLoading(false);
  }, []);

  // Select a zone
  const selectZone = (zoneId) => {
    const zone = Object.values(ZONES).find(z => z.id === zoneId);
    if (zone) {
      localStorage.setItem('speed_zone', JSON.stringify(zone));
      setSelectedZone(zone);
      return true;
    }
    return false;
  };

  // Clear selected zone
  const clearZone = () => {
    localStorage.removeItem('speed_zone');
    setSelectedZone(null);
  };

  // Switch to different zone
  const switchZone = (zoneId) => {
    return selectZone(zoneId);
  };

  // Get all available zones
  const getAllZones = () => {
    return Object.values(ZONES);
  };

  const value = {
    selectedZone,
    loading,
    selectZone,
    clearZone,
    switchZone,
    getAllZones,
    hasZoneSelected: !!selectedZone
  };

  return (
    <ZoneContext.Provider value={value}>
      {!loading && children}
    </ZoneContext.Provider>
  );
};

export default ZoneContext;
