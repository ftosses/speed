import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useAuth } from '../context/AuthContext';
import { useZone } from '../context/ZoneContext';

const ZoneSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectZone, getAllZones } = useZone();
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  const zones = getAllZones();

  const handleZoneSelect = (zoneId) => {
    setSelectedZoneId(zoneId);
  };

  const handleContinue = () => {
    if (selectedZoneId) {
      selectZone(selectedZoneId);
      navigate('/admin/dashboard');
    }
  };

  const getZoneIcon = (zoneId) => {
    const icons = {
      norte: '🗺️',
      sur: '🌆',
      centro: '🏙️',
      san_telmo: '🏛️'
    };
    return icons[zoneId] || '📍';
  };

  return (
    <div className="zone-selection-container">
      <div className="zone-selection-box">
        <div className="zone-selection-title">
          <h1>Bienvenido, {user?.name}</h1>
          <p>Seleccione la zona para trabajar hoy</p>
        </div>

        <div className="zone-cards">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`zone-card ${selectedZoneId === zone.id ? 'selected' : ''}`}
              onClick={() => handleZoneSelect(zone.id)}
              style={{ borderColor: selectedZoneId === zone.id ? zone.color : undefined }}
            >
              <div className="zone-card-icon" style={{ color: zone.color }}>
                {getZoneIcon(zone.id)}
              </div>
              <h3 className="zone-card-name">{zone.name}</h3>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button
            label="Continuar"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={handleContinue}
            disabled={!selectedZoneId}
            className="w-full"
          />
        </div>

        <div className="mt-3 text-center">
          <Button
            label="Cerrar Sesión"
            icon="pi pi-sign-out"
            className="p-button-text p-button-secondary"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ZoneSelection;
