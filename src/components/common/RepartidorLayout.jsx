import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RepartidorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Inicio', icon: 'pi pi-home', path: '/repartidor/home' },
    { label: 'Clientes', icon: 'pi pi-users', path: '/repartidor/clientes' },
    { label: 'Stock', icon: 'pi pi-box', path: '/repartidor/stock' },
    { label: 'Perfil', icon: 'pi pi-user', path: '/repartidor/perfil' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="repartidor-layout">
      {/* Header */}
      <div className="repartidor-header">
        <div className="flex align-items-center justify-content-between">
          <div>
            <h1>🚚 Speed Unlimited</h1>
            <p>Hola, {user?.name}</p>
          </div>
          <button
            className="p-button p-button-text p-button-rounded"
            style={{ color: 'white' }}
            onClick={handleLogout}
          >
            <i className="pi pi-sign-out"></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="repartidor-content">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="repartidor-bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`repartidor-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RepartidorLayout;
